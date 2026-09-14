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
	TIME_FORMAT_24_HOUR_PREF_NAME,
	toHour12Option,
	useIs24HourFormat
} from '../time-format';

const withPref = (value: string | undefined): void => {
	const settings = {
		...defaultSettings,
		prefs: {
			...defaultSettings.prefs,
			[TIME_FORMAT_24_HOUR_PREF_NAME]: value
		}
	} as unknown as AccountSettings;
	shell.useUserSettings.mockReturnValue(settings);
	shell.getUserSettings.mockReturnValue(settings);
};

describe('useIs24HourFormat', () => {
	it('returns false when the pref is not set', () => {
		withPref(undefined);
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(false);
	});

	it('returns false when the pref is "FALSE"', () => {
		withPref('FALSE');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(false);
	});

	it('returns true when the pref is "TRUE"', () => {
		withPref('TRUE');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(true);
	});

	it('returns false for an unexpected value rather than throwing', () => {
		withPref('garbage');
		const { result } = setupHook(useIs24HourFormat);
		expect(result.current).toBe(false);
	});
});

describe('getIs24HourFormat', () => {
	it('returns false when the pref is not set', () => {
		withPref(undefined);
		expect(getIs24HourFormat()).toBe(false);
	});

	it('returns true when the pref is "TRUE"', () => {
		withPref('TRUE');
		expect(getIs24HourFormat()).toBe(true);
	});
});

describe('toHour12Option', () => {
	it('returns undefined when the value is not set, letting the locale decide', () => {
		expect(toHour12Option(undefined)).toBeUndefined();
	});

	it('returns true when the value is explicitly "FALSE"', () => {
		expect(toHour12Option('FALSE')).toBe(true);
	});

	it('returns false when the value is "TRUE"', () => {
		expect(toHour12Option('TRUE')).toBe(false);
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
