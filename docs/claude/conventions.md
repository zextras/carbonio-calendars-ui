# Coding conventions

ESLint config lives in `.eslintrc.js` on top of `@zextras/carbonio-ui-configs/rules/eslint`. Prettier config extends `@zextras/carbonio-ui-configs/rules/prettier`. TS config extends `@zextras/carbonio-ui-configs/rules/tsconfig.type-check.json`.

## SPDX license header

Every `.ts`/`.tsx`/`.js`/`.jsx` source file must start with:

```ts
/*
 * SPDX-FileCopyrightText: <YEAR> Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
```

Template at `src/notice.template.ts`. `eslint-plugin-notice` enforces this — `pnpm run lint-errors` will fail without it. `<YEAR>` is auto-substituted when ESLint fixes the violation.

## Path aliases

- Source imports: `baseUrl: ./src`, so `import foo from 'constants/...'` resolves to `src/constants/...`. Prefer this over deep relative chains (`../../../constants`).
- Test-only aliases (never import from production code): `@test-setup`, `@jest-setup`, `@test-utils/*`, `@test-mocks/*`.

## Import order

Enforced by `import/order`:

1. `react` first.
2. Other builtin / external modules.
3. Internal modules.
4. Relative imports.
5. Blank line between each group; alphabetized case-insensitively inside groups.

Let `pnpm run lint-fix` sort this — don't hand-tune.

## Types & `any`

- `@typescript-eslint/no-explicit-any` is a **warning**, not an error. Prefer a proper type, but don't contort generics to avoid a single `any` in legacy code paths.
- `noUncheckedIndexedAccess` is **off** in `tsconfig.json`. Array/object indexing returns `T`, not `T | undefined` — be defensive when it actually matters.
- `unused-imports/no-unused-imports` is a warning; CI via `lint-check` only blocks on errors, but keep imports clean.

## `console` usage

`no-console` allows `console.warn` and `console.error` only. Use those (or throw) — never `console.log` in committed code.

## File & directory layout

- Co-locate tests: `foo.tsx` + `foo.test.tsx` (or `foo.test.ts`). A `tests/` sub-folder is also used in some areas (e.g. `src/soap/tests/`, `src/view/calendar/tests/`).
- One SOAP request per file in `src/soap/`, named `<operation>-request.ts` with a matching exported function.
- One normalizer per domain in `src/normalizations/`.
- Redux reducer functions live in `src/store/reducers/`, imported and composed inside the corresponding slice — keep the slice file declarative.
- Types go in `src/types/` when shared, or alongside the module when single-use.

## Styling

- `@emotion/react` + `@emotion/styled`. Vite/Babel are configured with `jsxImportSource: '@emotion/react'` and the emotion Babel plugin — the `css` prop works without extra annotation.
- Design system components come from `@zextras/carbonio-design-system`. Prefer them over hand-rolled elements; use their `ThemeProvider` tokens instead of raw hex values.
- `@emotion/jest` matcher `toHaveStyleRule` is registered globally in tests.

## i18n

- `react-i18next`; use `const [t] = useTranslation();` then `t('key.path', 'English fallback')`.
- Every `t()` call must include the English fallback string — the tooling syncs these to translation files; Jenkins disables auto-sync (`disableAutoTranslationsSync: true`) so keys must be stable.
- Test i18n uses `getAppI18n()` from `src/__test__/i18n/i18n-test-factory`.

## Commits

Conventional Commits (`@commitlint/config-conventional`) enforced by Husky. Typical types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `build`, `ci`, `style`. Reference Jira issue keys in the subject or body when applicable (e.g. `feat(CO-1234): ...`).

## SonarJS warnings

Many `sonarjs/*` rules are downgraded to warnings (cognitive-complexity, duplicate-string, identical-functions, etc.). Treat them as hints during review, not hard blockers — but don't regress areas that are currently clean.
