# Testing

Runner is **Vitest** (jsdom environment). Configured in `vitest.config.ts`; setup files run in this order:

1. `src/__test__/worker-setup.ts` — stubs `Worker`.
2. `src/__test__/vitest-setup.tsx` — global mocks, MSW server, fake timers, window mocks.
3. `src/__test__/setup-browser-env.ts` — extra browser env polyfills.

`globals: true` — `vi`, `expect`, `describe`, `it`, `beforeEach`, etc. are global. Don't import them from `vitest` in tests (ESLint via `eslint-plugin-vitest-globals` knows about this).

## Running tests

```bash
pnpm test                                   # full suite, single pass
pnpm test:watch                             # watch mode
pnpm vitest run path/to/file.test.tsx       # single file
pnpm vitest run -t "handles overlap"        # filter by name (substring / regex)
pnpm coverage                               # v8 coverage → coverage/
```

JUnit XML is always written to `junit.xml` (used by CI).

## Test utilities

Import from the aliases defined in `tsconfig.json`:

- `@test-setup` → `src/__test__/test-setup.tsx` — `setupTest`, `setupHook`, custom `screen`/`within`, `makeListItemsVisible`, `triggerLoadMore`.
- `@jest-setup` → `src/__test__/vitest-setup.tsx` — legacy alias; `getSetupServer()` exposes the MSW server, `abortSpy` tracks `AbortController.abort` calls.
- `@test-utils/*` → `src/__test__/mocks/*` — MSW handlers and domain mocks.
- `@test-mocks/*` → `__mocks__/*` — root-level module mocks.

Always render through `setupTest(ui, { store, initialEntries, path })` instead of raw `render`. It wires `ThemeProvider`, `MemoryRouter`, optional Redux `Provider`, `I18nextProvider`, `SnackbarManager`, `ModalManager`, and returns a `userEvent` with fake-timer-aware `advanceTimers` plus extras (`rightClick`, `pasteInto`). For hooks, use `setupHook`.

Generators and canned data live in `src/test/generators/` and `src/test/mocks/`. Prefer these over ad-hoc fixtures.

## MSW

Every SOAP endpoint the app touches is registered in `vitest-setup.tsx`'s `defaultBeforeAllTests`. To add or override behavior in a test:

```ts
import { getSetupServer } from '@jest-setup';
import { http, HttpResponse } from 'msw';

getSetupServer().use(
  http.post('/service/soap/CreateAppointmentRequest', () => HttpResponse.json({ /* ... */ }))
);
```

`onUnhandledRequest: 'warn'` is the default — an unhandled request won't fail the test but will print. `restoreMocks: true` + `clearMocks: true` are on, so per-test `vi.spyOn`/`vi.fn` state resets automatically.

## Auto-mocked modules

`vi.mock` is called unconditionally at the top of `vitest-setup.tsx` for:

- `darkreader`
- `@zextras/carbonio-shell-ui` — manual mock at `__mocks__/@zextras/carbonio-shell-ui.tsx`
- `@zextras/carbonio-ui-soap-lib` — manual mock at `__mocks__/@zextras/carbonio-ui-soap-lib.ts`
- `@zextras/carbonio-ui-preview` — manual mock at `__mocks__/@zextras/carbonio-ui-preview.ts`
- `zustand` — manual mock at `__mocks__/zustand.ts` (isolates zustand store state between tests)

Extend these mock files when you need new shell APIs in tests; don't re-`vi.mock` in individual test files.

## Timers and timezone

- `beforeEach`: `moment.tz.setDefault(VITEST_DEFAULT_TIMEZONE)`, `Intl.DateTimeFormat.prototype.resolvedOptions` stubbed, `vi.useFakeTimers({ shouldAdvanceTime: true })`.
- `afterEach`: `vi.clearAllTimers()` + `vi.useRealTimers()`.

Consequences:
- Don't assert on literal ISO strings that embed a local offset — use `moment` formatters tied to the pinned TZ, or use relative assertions.
- `userEvent` interactions need `advanceTimers: vi.advanceTimersByTime` — `setupTest` already does this; if you instantiate `userEvent.setup()` manually, pass it yourself.
- Async code that relies on `setTimeout` / `setInterval` needs `vi.advanceTimersByTime(...)` or `vi.runAllTimersAsync()` to progress.

## Custom queries

`test-setup.tsx` adds `{query,get,find}[All]ByRoleWithIcon(role, { icon })` — use it to find buttons by their inner `data-testid` icon, which is how the design system renders icon buttons.

## Integration tests

`src/integration-tests/` contains broader flows (calendar create/delete/restore, viewing appointments). They use the same `setupTest` + MSW machinery — no separate config.
