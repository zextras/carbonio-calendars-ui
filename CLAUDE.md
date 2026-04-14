# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
pnpm run build          # Production build
pnpm run build:dev      # Development build with timestamp
pnpm run start          # Watch mode dev server

# Type checking
pnpm run type-check
pnpm run type-check:watch

# Linting
pnpm run lint           # Run ESLint
pnpm run lint-fix       # Auto-fix lint issues
pnpm run lint-check     # Run lint + type-check together

# Testing
pnpm run test           # Run all tests once (Vitest)
pnpm run test:watch     # Run tests in watch mode
pnpm run coverage       # Generate coverage report
```

**Run a single test file:**
```bash
pnpm exec vitest run src/path/to/file.test.tsx
```

**Run tests matching a pattern:**
```bash
pnpm exec vitest run --reporter=verbose -t "test name pattern"
```

Node v22 and pnpm >=10 are required.

## Architecture

This is a **Zextras Carbonio** calendar module — a React app that runs as a plugin inside the Carbonio Shell UI host application. It is not a standalone app; it registers itself into the shell at runtime via `src/app.tsx`.

### Module Integration

The app integrates with the Carbonio ecosystem via `@zextras/carbonio-shell-ui`, calling functions like `addRoute`, `addSettingsView`, `addBoardView` at startup. The main entry is `src/app.tsx`. The base URL path is `/calendars`.

### State Management

Two stores run in parallel:

1. **Redux** (`src/store/redux/`) — primary store for appointments, editor state, and invites.
   - Slices: `src/store/slices/` (appointments, editor, invites)
   - Async thunks: `src/store/actions/` (SOAP calls for create/modify/delete/search)
   - Selectors: `src/store/selectors/`

2. **Zustand** (`src/store/zustand/`) — used for calendar groups configuration.

### Backend Communication

All backend calls go through SOAP requests (not REST). Request definitions live in `src/soap/` (25+ files). The main shell provides the SOAP transport via `@zextras/carbonio-shell-ui`. Data normalization from SOAP responses happens in `src/normalizations/`.

### Main Views

- `src/view/calendar/` — main calendar interface wrapping `react-big-calendar`; includes custom toolbar and event rendering
- `src/view/editor/` — appointment editor board (modal-style board panel)
- `src/view/event-panel-view/` — read-only event detail panel
- `src/view/secondary-bar/` — left sidebar with calendar list and navigation
- `src/view/modals/` — confirmation/action dialogs
- `src/view/reminder/` — appointment reminder notifications
- `src/view/search/` — search results integration
- `src/settings/` — settings views (general, permissions, schedules)

### Testing Setup

- Framework: **Vitest** with jsdom environment
- Network mocking: **MSW** (Mock Service Worker) — handlers in `src/__test__/mocks/network/msw/`
- Setup files: `src/__test__/vitest-setup.tsx`, `src/__test__/worker-setup.ts`, `src/__test__/setup-browser-env.ts`
- Test utilities and fixtures in `src/__test__/mocks/`
- Path aliases for tests: `@test-mocks/*` → `__mocks__/*`, `@test-utils/*` → `__test__/mocks/*`

### Key Libraries

- `react-big-calendar` — calendar grid component
- `@emotion/react` + `@emotion/styled` — CSS-in-JS styling
- `@zextras/carbonio-design-system` — shared UI component library
- `@zextras/carbonio-ui-commons` — shared utilities across Carbonio modules
- `date-fns` — date/time handling (moment and moment-timezone have been removed)
- `src/commons/date-fns-react-widgets-localizer.ts` — locale-aware localizer for react-widgets date pickers; call `dateFnsLocalizer()` once at module level where needed, use `getDateFnsLocale()` to pass the current locale to `DateTimePicker`
- `i18next` + `react-i18next` — internationalization