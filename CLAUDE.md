# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`carbonio-calendars-ui` is the Calendars module for Zextras Carbonio, shipped as a micro-frontend loaded at runtime by `@zextras/carbonio-shell-ui`. It is not a standalone SPA: it registers routes, a settings view, a board view, a secondary bar, a search view, and integration functions into the shell (see `src/app.tsx`). Build output is consumed as a static bundle served from `/static/iris/<package>/<commitHash>/`.

Package manager is **pnpm** (v10, enforced by `engines`). Node **v22** (`.nvmrc`). Build/watch are driven by `@zextras/carbonio-ui-sdk` (webpack-based) — `vite`/`vitest` are used only for tests.

## Commands

```bash
pnpm install                    # install deps
pnpm run sdk-install            # initial SDK setup (required once after clone)
pnpm run start -- -h <host>     # dev watch; -h is a Carbonio host to proxy against (required)
pnpm run build                  # production build (sdk build → dist/)
pnpm run build:dev              # dev build with timestamped pkgRel

pnpm run type-check             # tsc --noEmit
pnpm run lint                   # eslint (warnings + errors)
pnpm run lint-errors            # eslint, errors only (--quiet)
pnpm run lint-fix               # eslint --fix
pnpm run lint-check             # lint-errors + type-check (CI gate)

pnpm run test                   # vitest run (single pass)
pnpm run test:watch             # vitest watch
pnpm run coverage               # vitest with v8 coverage → coverage/

# run a single test file / filter by name
pnpm vitest run src/hooks/use-event-actions.test.tsx
pnpm vitest run -t "pattern in describe/it name"
```

Commits are validated by commitlint (`@commitlint/config-conventional`) via a Husky hook. Use conventional commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`).

## Architecture at a glance

- **Entry**: `src/app.tsx` registers everything with `carbonio-shell-ui` (`addRoute`, `addBoardView`, `addSettingsView`, `registerActions`, `registerFunctions`, `registerComponents`). All top-level views are lazy-loaded and wrapped in `StoreProvider` + `ModalManager` + `AuthGuard`.
- **Dual state**: Redux Toolkit holds appointment/invite/editor domain state (`src/store/redux`, slices under `src/store/slices`, reducers under `src/store/reducers`). Zustand holds lighter UI/app state and calendar groups (`src/store/zustand`). Choose Redux for editor/appointment/invite data; Zustand for view-local or cross-cutting UI state.
- **SOAP layer**: `src/soap/*-request.ts` files each wrap one Zimbra SOAP call via `@zextras/carbonio-ui-soap-lib`. Responses are transformed into app models by `src/normalizations/*`. Never call SOAP from components — go through a soap module, normalize, then dispatch/update store.
- **Views** (`src/view/`): `calendar` (react-big-calendar wrapper), `editor` (appointment compose board), `event-panel-view`, `event-summary-view`, `reminder`, `search`, `secondary-bar`, `tags`, `modals`, `notifications`. The secondary bar is the left-hand calendar tree shown by the shell.
- **Folder/tag data** comes from `@zextras/carbonio-ui-commons` (`useFoldersMap`, `useInitializeFolders`) — do not re-implement folder fetching.
- **BASE_PATH** is a build-time global: webpack injects the hashed static path; `vitest.config.ts` injects `/calendars`. Don't hardcode paths.

For deeper detail see:
- [docs/claude/architecture.md](docs/claude/architecture.md) — store layout, SOAP/normalization flow, editor lifecycle, shell integration
- [docs/claude/testing.md](docs/claude/testing.md) — vitest setup, MSW handlers, `setupTest`/`setupHook`, path aliases, timezone pinning
- [docs/claude/conventions.md](docs/claude/conventions.md) — SPDX header, import ordering, ESLint quirks, path aliases, i18n

## Non-obvious gotchas

- Tests pin timezone via `VITEST_DEFAULT_TIMEZONE` (`src/constants/test-environment.ts`) — `process.env.TZ` is set in `vitest.config.ts` before any test loads. Don't use raw `new Date()` literals in assertions; rely on `moment-timezone`.
- `vi.mock('@zextras/carbonio-shell-ui')` and `@zextras/carbonio-ui-soap-lib` are auto-mocked for every test via `src/__test__/vitest-setup.tsx`; the real mocks live in `__mocks__/@zextras/`.
- `useFakeTimers({ shouldAdvanceTime: true })` is active in every test `beforeEach`. When using `userEvent`, always set it up with `advanceTimers: vi.advanceTimersByTime` (the `setupTest` helper does this).
- Every source file must start with the SPDX notice (`src/notice.template.ts`); ESLint `notice/notice` will fail otherwise.
- `@types/webpack` is a runtime dep because `carbonio.webpack.js` customizes the SDK's webpack config (aliases `app-entrypoint`, copies text-composer assets, injects `BASE_PATH`).
