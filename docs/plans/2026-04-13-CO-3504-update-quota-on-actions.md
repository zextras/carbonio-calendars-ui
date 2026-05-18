# CO-3504: Update quota data on quota-impacting actions

**Date:** 2026-04-13
**Status:** Approved
**Author:** Luca Stauble + Claude
**Jira Issue:** [CO-3504](https://zextras.atlassian.net/browse/CO-3504)

## Context

As a user, I want the quota information to be updated right after an action that impacts my quota is performed (create / update / permanently delete an appointment, empty the calendar trash). Currently, quota data is only refreshed by the shell's periodic polling (NoOp), so changes are not reflected immediately after these actions in calendars-ui.

Quota is managed by the shell (`useAccountStore.usedQuota`). The storages module registers an integrated function `storages-refresh-quota` that can be called to force a refresh. The calendars-ui module needs to signal when a quota-impacting action occurs. The carbonio-mails-ui module already implements this pattern for CO-3475, which we mirror here with a lean module-local scaffold.

### Scope

In scope — dispatch `QuotaChangedEvent` after successful SOAP response, gated by a ≥ 1 MB attachments-size threshold:

1. **Create appointment** — `src/store/actions/new-create-appointment.ts` (`CreateAppointment`).
2. **Modify appointment** — `src/store/actions/new-modify-appointment.ts` (`ModifyAppointment` / `CreateAppointmentException`).
3. **Permanently delete appointment** — `src/store/actions/delete-appointment-permanent.ts` (`ItemAction op=delete`).
4. **Empty calendar trash** — `src/soap/empty-calendar-trash-request.ts` (`EmptyCalendarTrash`). Size is unknown at call time, so the threshold is bypassed and the event is always published.

Out of scope:

- Move appointment to trash (`CancelAppointment`) — aligned with the mails-ui decision to treat trash as a non-quota action.
- Send invite reply, propose new time, forward, delete calendar, alarm dismiss/snooze, tag/folder operations.
- Receiving invites / attachments — already covered by carbonio-mails-ui (CO-3475).

## Decision

**Solution 2 — Lean event-bus + shared attachments-size utility.**

Rationale:

- Matches the module-local event-bus + listener shape used by mails-ui, so contributors familiar with mails-ui recognize the architecture.
- Keeps the file count minimal by skipping the full `EventsBusEventsMap` scaffold (we only have one event today).
- Isolates the only tricky piece — computing attachment size from two different shapes (`Editor` for create/modify, `Invite` for permanent-delete) — in a single testable utility, avoiding duplicated logic across action files.
- Keeps action code readable: a one-line publish call with a clear helper.

## Implementation Steps

### 1. Event + publisher

**File:** `src/event-bus/quota-changed.ts` *(new)*

Export:

- `class QuotaChangedEvent extends CustomEvent<undefined>` with `static readonly EventName = 'carbonio:calendars:eventbus:quota-changed'` and a zero-argument constructor.
- `const ONE_MB = 1024 * 1024`.
- `publishQuotaChangedEvent(sizeInBytes: number): void` — calls `window.dispatchEvent(new QuotaChangedEvent())` only when `sizeInBytes > ONE_MB`.
- `publishQuotaChangedEventUnconditional(): void` — always dispatches (size-unknown cases such as empty-trash).

All file headers use the SPDX 2026 notice per `src/notice.template.ts`.

### 2. Attachments-size utility

**File:** `src/utils/attachments-size.ts` *(new)*

Export:

- `getEditorAttachmentsSize(editor: Editor): number` — sums bytes from `editor.attachmentFiles?.[i]?.size` (newly uploaded `File`/part objects) plus sizes under `editor.attach?.mp?.[i]?.s` (attachments already on the server). Returns `0` on missing/empty data.
- `getInviteAttachmentsSize(invite: Invite): number` — walks `invite.parts` (and any nested `.mp`) and sums the `s` field of parts whose `cd` is `attachment`. Returns `0` on missing data.

Both functions must be null-safe and must not throw on partial shapes.

### 3. Listener component

**File:** `src/components/quota-refresh-handler.tsx` *(new)*

- React component rendering `null`.
- In a single `useEffect`, adds a `window.addEventListener(QuotaChangedEvent.EventName, handler)`. The handler calls `getIntegratedFunction('storages-refresh-quota')` (import from `@zextras/carbonio-shell-ui`) and, if `isAvailable === true`, invokes the returned function. No-ops when unavailable.
- Returns a cleanup function that removes the listener.

### 4. Mount the listener

**File:** `src/app.tsx` *(modify)*

Inside the `<AuthGuard>` block, render `<QuotaRefreshHandler />` alongside `<AppointmentReminder />`, `<InitializeTags />`, `<SyncDataHandler />`, `<Notifications />`. It does not need to live inside `<StoreProvider>` (no Redux access).

### 5. Dispatch at each quota-impacting site

- **`src/store/actions/new-create-appointment.ts`** — after the successful `legacySoapFetch('CreateAppointment')` response (i.e. when `response?.error` is false), call:
  ```ts
  publishQuotaChangedEvent(getEditorAttachmentsSize(editor));
  ```
  before returning the payload.

- **`src/store/actions/new-modify-appointment.ts`** — in both success branches (`CreateAppointmentException` path and `ModifyAppointment` path), immediately before returning `{ response, editor: updatedEditor }`, call the same `publishQuotaChangedEvent(getEditorAttachmentsSize(editor))`.

- **`src/store/actions/delete-appointment-permanent.ts`** — convert the thunk to receive `getState` (second arg of the `async` callback), look up the invite via `getState().invites.invites[id]`, and call:
  ```ts
  publishQuotaChangedEvent(getInviteAttachmentsSize(invite));
  ```
  after `itemActionRequest` resolves without error, before returning `{ response, id }`. If the invite is not present in state (edge case), pass `0` so no event fires.

- **`src/soap/empty-calendar-trash-request.ts`** — inside the `.then` success branch (non-`Fault` path), before returning `response`, call `publishQuotaChangedEventUnconditional()`.

### 6. Tests

Unit-level:

- **`src/event-bus/tests/quota-changed.test.ts`** — verify event name, constructor produces a `CustomEvent` with the expected type, `publishQuotaChangedEvent` dispatches only when size `> ONE_MB` (cases: `0`, `ONE_MB`, `ONE_MB + 1`), `publishQuotaChangedEventUnconditional` always dispatches. Use `vi.spyOn(window, 'dispatchEvent')`.

- **`src/utils/tests/attachments-size.test.ts`** — cases for:
  - `getEditorAttachmentsSize`: empty editor, only `attachmentFiles`, only `attach.mp`, both combined, missing `size`/`s` fields.
  - `getInviteAttachmentsSize`: no parts, flat parts, nested `mp`, non-attachment parts ignored.

- **`src/components/tests/quota-refresh-handler.test.tsx`** — renders the component via `setupTest`, dispatches `new QuotaChangedEvent()`, asserts the mocked `getIntegratedFunction('storages-refresh-quota')` tuple's function was called; asserts no call when `isAvailable === false`; asserts listener is removed on unmount.

Integration-level (extend existing suites, don't introduce new infra):

- Extend **`src/store/actions/tests/new-create-appointment.test.ts`** (create file if missing) — after the existing SOAP-success assertion, also `vi.spyOn(window, 'dispatchEvent')` and assert it was called with a `QuotaChangedEvent` when the editor has attachments > 1 MB, and not called when ≤ 1 MB.

- Extend **`src/store/actions/tests/new-modify-appointment.test.ts`** (create if missing) — same spy pattern across both branches (`ModifyAppointment` and `CreateAppointmentException`).

- Extend **`src/store/actions/tests/delete-appointment-permanent.test.ts`** (create if missing) — stub the invites slice with a canned invite whose attachments sum > 1 MB, assert dispatch; and a second case with ≤ 1 MB, assert no dispatch.

- Extend **`src/soap/tests/empty-calendar-trash-request.test.ts`** (create if missing) — assert `QuotaChangedEvent` is dispatched unconditionally on success and not dispatched on Fault.

All new/modified test files must use the existing `setupTest`/MSW pattern and follow the conventions documented in `docs/claude/testing.md`.

### 7. Lint / type-check

Run `pnpm run lint-check` and `pnpm run test` before considering the task done. New files must carry the SPDX notice; `notice/notice` will flag otherwise.

## Alternatives Considered

### Solution 1 — Lean event-bus + inline size computation per action

Same two new files (event + listener), but the attachment-size summing is inlined into each of the four dispatch sites. Rejected because the editor-side and invite-side attachment shapes differ; inlining would duplicate (and risk diverging) two pieces of logic across three action files, for the sake of a single file saved.

### Solution 3 — Redux middleware + listener

A Redux middleware watching for `createAppointment.fulfilled` / `modifyAppointment.fulfilled` / `deleteAppointmentPermanent.fulfilled` actions and publishing the event from their payloads; action files would stay untouched. Rejected because:

- Empty-calendar-trash is a direct SOAP call, not a thunk, so it still needs a separate dispatch path — breaking the "centralized" promise.
- The middleware would couple to `createAsyncThunk` internals (`action.meta.arg`, payload shape) and be fragile.
- Diverges from the mails-ui precedent, hurting cross-module familiarity.
- Makes quota side-effects invisible when reading the action files in isolation.
