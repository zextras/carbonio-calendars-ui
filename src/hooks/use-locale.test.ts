/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AccountSettings } from '@zextras/carbonio-shell-ui';

import { getLocale, useLocale } from './use-locale';
import { setupHook } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';

const withLocalePref = (zimbraPrefLocale: string | undefined): void => {
	const settings = {
		...defaultSettings,
		prefs: {
			...defaultSettings.prefs,
			zimbraPrefLocale
		}
	} as unknown as AccountSettings;
	shell.useUserSettings.mockReturnValue(settings);
	shell.getUserSettings.mockReturnValue(settings);
};

describe('useLocale', () => {
	it('returns the zimbraPrefLocale pref when set', () => {
		withLocalePref('it');
		const { result } = setupHook(useLocale);
		expect(result.current).toBe('it');
	});

	it('falls back to navigator.language when the pref is not set', () => {
		withLocalePref(undefined);
		const { result } = setupHook(useLocale);
		expect(result.current).toBe(navigator.language);
	});
});

describe('getLocale', () => {
	it('returns the zimbraPrefLocale pref when set', () => {
		withLocalePref('de');
		expect(getLocale()).toBe('de');
	});

	it('falls back to navigator.language when the pref is not set', () => {
		withLocalePref(undefined);
		expect(getLocale()).toBe(navigator.language);
	});
});
