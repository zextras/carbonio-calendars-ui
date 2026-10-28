/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings } from '@zextras/carbonio-shell-ui';
import { usePrefs } from '@zextras/carbonio-ui-commons';
import type { AccountSettingsPrefs } from '@zextras/carbonio-ui-soap-lib';

/**
 * Shared derivation, for callers that already have `prefs` in scope (e.g. alongside
 * other pref-derived values in the same hook) and shouldn't fetch it a second time.
 */
export function localeFromPrefs(prefs: Pick<AccountSettingsPrefs, 'zimbraPrefLocale'>): string {
	return prefs.zimbraPrefLocale ?? navigator.language;
}

/** Non-hook getter, for code that cannot use hooks (e.g. Redux action creators). */
export function getLocale(): string {
	return localeFromPrefs(getUserSettings().prefs);
}

/** Hook, for React components/hooks — reactive via usePrefs(). */
export function useLocale(): string {
	return localeFromPrefs(usePrefs());
}
