/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AccountSettings } from '@zextras/carbonio-shell-ui';

import { setupHook } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';

import {
	getCalendarEventEdgeToken,
	getCalendarGridTimeToken,
	getDateTimeToken,
	getHour12Option,
	getIs24HourFormat,
	getPickerTimeFormatToken,
	getTimeOnlyLiteralToken,
	getTimeOnlyToken,
	TIME_FORMAT_PREF_NAME,
	toHour12Option,
	useIs24HourFormat
} from '../time-format';

const withPref = (value: string | undefined, locale = 'en'): void => {
	const settings = {
		...defaultSettings,
		prefs: {
			...defaultSettings.prefs,
			zimbraPrefLocale: locale,
			[TIME_FORMAT_PREF_NAME]: value
		}
	} as unknown as AccountSettings;
	shell.useUserSettings.mockReturnValue(settings);
	shell.getUserSettings.mockReturnValue(settings);
};

/**
 * src/__test__/vitest-setup.tsx globally stubs Intl.DateTimeFormat#resolvedOptions
 * (to pin the timezone), so it no longer reflects the locale actually passed to the
 * constructor. Re-stub it here to simulate what a 12h/24h locale would resolve to.
 */
const mockLocaleHour12 = (hour12: boolean): void => {
	const original = new Intl.DateTimeFormat().resolvedOptions();
	vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
		...original,
		hour12
	});
};

describe('useIs24HourFormat', () => {
	it('falls back to the locale convention when the pref is not set (12h locale)', () => {
		mockLocaleHour12(true);
		withPref(undefined, 'en-US');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(false);
	});

	it('falls back to the locale convention when the pref is not set (24h locale)', () => {
		mockLocaleHour12(false);
		withPref(undefined, 'it');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(true);
	});

	it('returns false when the pref is "12h" even on a 24h locale', () => {
		mockLocaleHour12(false);
		withPref('12h', 'it');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(false);
	});

	it('returns true when the pref is "24h" even on a 12h locale', () => {
		mockLocaleHour12(true);
		withPref('24h', 'en-US');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(true);
	});

	it('falls back to the locale convention for an unexpected value rather than throwing', () => {
		mockLocaleHour12(true);
		withPref('garbage', 'en-US');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(false);
	});
});

describe('getIs24HourFormat', () => {
	it('falls back to the locale convention when the pref is not set (12h locale)', () => {
		mockLocaleHour12(true);
		withPref(undefined, 'en-US');
		expect(getIs24HourFormat()).toBe(false);
	});

	it('falls back to the locale convention when the pref is not set (24h locale)', () => {
		mockLocaleHour12(false);
		withPref(undefined, 'it');
		expect(getIs24HourFormat()).toBe(true);
	});

	it('returns true when the pref is "24h"', () => {
		mockLocaleHour12(true);
		withPref('24h', 'en-US');
		expect(getIs24HourFormat()).toBe(true);
	});
});

describe('toHour12Option', () => {
	it('returns undefined when the value is not set, letting the locale decide', () => {
		expect(toHour12Option(undefined)).toBeUndefined();
	});

	it('returns true when the value is explicitly "12h"', () => {
		expect(toHour12Option('12h')).toBe(true);
	});

	it('returns false when the value is "24h"', () => {
		expect(toHour12Option('24h')).toBe(false);
	});

	it('returns undefined for an unexpected value rather than throwing', () => {
		expect(toHour12Option('garbage')).toBeUndefined();
	});
});

describe('token getters', () => {
	it.each([
		['getTimeOnlyToken', getTimeOnlyToken, 'HH:mm', 'p'],
		['getTimeOnlyLiteralToken', getTimeOnlyLiteralToken, 'HH:mm', 'hh:mm a'],
		['getDateTimeToken', getDateTimeToken, 'P HH:mm', 'Pp'],
		['getCalendarGridTimeToken', getCalendarGridTimeToken, 'HH:mm', 'p'],
		['getCalendarEventEdgeToken', getCalendarEventEdgeToken, 'HH:mm', 'h:mma'],
		['getPickerTimeFormatToken', getPickerTimeFormatToken, 'HH:mm', 'hh:mm a']
	])(
		'%s returns the 24h token when true, the 12h token otherwise',
		(_name, fn, token24, token12) => {
			expect(fn(true)).toBe(token24);
			expect(fn(false)).toBe(token12);
		}
	);

	it('getHour12Option returns the boolean negation of is24h', () => {
		expect(getHour12Option(true)).toBe(false);
		expect(getHour12Option(false)).toBe(true);
	});
});
