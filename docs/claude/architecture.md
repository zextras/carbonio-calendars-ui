# Architecture

Detailed notes for Claude Code. High-level entry points and integration are in the main `CLAUDE.md`.

## Shell integration (`src/app.tsx`)

The module registers with `@zextras/carbonio-shell-ui` at mount time:

- `addRoute` — main calendar view under `CALENDAR_ROUTE`, with `SecondaryBarView` as the left rail.
- `addBoardView` — the editor opens as a "board" (shell's tabbed workspace), keyed by `CALENDAR_BOARD_ID`.
- `addSettingsView` — settings sub-sections come from `src/settings/sub-sections.ts`.
- `registerActions<NewAction>` — the global "New Appointment" primary action.
- `registerFunctions` — exposes `CalendarIntegrations.CREATE_APPOINTMENT` so other modules (e.g. Mail) can open a prefilled editor.
- `registerComponents({ id: 'invites-reply' })` — renders invite RSVPs inside Mail.
- `useIntegratedFunction('search-add-view')` / `search-remove-view` — wires the calendar search view into the shell search UI.

Every top view is wrapped in `StoreProvider` + `ModalManager` (and `AuthGuard` at the root). Don't skip the provider wrapping when adding a new registered view.

## Store

Two stores coexist. Pick the right one for the data:

### Redux (`src/store/redux/index.tsx`)

Three slices:

- `appointments` (`src/store/slices/appointments-slice.ts`) — fetched appointment lists keyed by range.
- `invites` (`src/store/slices/invites-slice.ts`) — full invite details (attendees, attachments, body) fetched on demand.
- `editor` (`src/store/slices/editor-slice.ts`) — the in-progress editor(s); each open editor is keyed by its `editorId`. Reducers live in `src/store/reducers/editor-reducers.ts` and are composed in the slice.

`src/store/selectors/` has memoized selectors — prefer them over inline `state => ...` in components.

Use `useAppDispatch` / `useAppSelector` from `src/store/redux/hooks.ts` (properly typed against `RootState`/`AppDispatch`).

### Zustand (`src/store/zustand/`)

- `store.ts` — `useAppStatusStore`: current calendar view, date, visible range (capped at 400 days), summary view id/ref.
- `calendar-group-store.ts` — calendar groups fetched via `getCalendarGroupsRequest`.

Zustand stores are read with selectors directly in components; mutations go through exported setters, not `set` from outside.

## SOAP and normalization

Each SOAP operation has a dedicated module in `src/soap/*-request.ts`. They use `@zextras/carbonio-ui-soap-lib` (mocked via `carbonio-ui-soap-lib.ts` at the root and in `__mocks__/@zextras/`).

Flow for new data:

1. Call the `src/soap/*-request.ts` function.
2. Pass the raw response through a normalizer in `src/normalizations/` (`normalize-appointments.ts`, `normalize-invite.ts`, `normalize-editor.ts`, `normalize-calendar-events.ts`, `normalize-reminder.ts`, `normalize-soap-message-from-editor.ts`).
3. Dispatch into Redux or update the Zustand store.

The reverse flow (editor → SOAP) goes through `normalize-soap-message-from-editor.ts` + `src/commons/editor-save-send-fns.ts`.

Batching: `src/soap/batch-request.ts` composes multiple requests into a single BatchRequest.

## Editor lifecycle

- Creation: `src/commons/editor-generator.ts` builds a blank editor; `createNewEditor` action adds it to the `editor` slice.
- Open on a board: `addBoard` from `carbonio-shell-ui` opens `EditorView` (`src/view/editor/editor-board-wrapper.tsx`); `use-fetch-editor-resources.ts` populates rooms/equipment.
- Save/send: `src/commons/editor-save-send-fns.ts` → normalizer → `create-appointment` / `modify-appointment` SOAP → dispatch to `appointments` + `invites` + close board.
- Recurrence UI state uses `src/commons/recurrence-context.tsx`; don't store recurrence draft in Redux — it lives in context for the editor session.

## Calendar view

`src/view/calendar/calendar-view.tsx` wraps `react-big-calendar`. Custom event rendering: `custom-event.tsx`, `custom-event-icon.tsx`, `custom-event-reply-icons.tsx`, `custom-event-free-busy-status.tsx`, `custom-show-more-button.tsx`, `custom-toolbar.tsx`. Styles in `calendar-style.tsx`. The `work-view.tsx` is a custom "work week" view built on `date-arithmetic` (custom type augmentations in `src/react-big-calendar-lib.d.ts`).

## Folder & tag data

Folders (calendars) are managed by `@zextras/carbonio-ui-commons`. Use:

- `useInitializeFolders(FOLDER_VIEW.appointment)` once at app root — already done in `app.tsx`.
- `useFoldersMap()` / `useFoldersMapByView(...)` to read.
- `useFolder(id)` for a single folder.

Tags come from the shell (`useTags` in `carbonio-shell-ui`). `InitializeTags` in `src/view/tags/initialize-tags.tsx` hydrates them.

## Cross-module integrations (`src/shared/`)

- `create-apppointment-integration/` — registered as `CalendarIntegrations.CREATE_APPOINTMENT` for other modules to call.
- `invite-response/` — rendered inside Mail message bodies when the message is an iTIP invite.

Changes to these modules must preserve their public contracts; other apps import them at runtime via the shell's `registerFunctions` / `registerComponents` bus.
