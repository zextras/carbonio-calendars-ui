/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useGetDateRangeConvertedToTimezone } from './use-get-date-range-converted-to-timezone';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupHook } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';

/*
 * useGetDateRangeConvertedToTimezone is a utility hook which converts a date range to a given timezone.
 *
 * It receives start and end dates in number format as arguments. It can also optionally receive a timezone or a boolean
 * to indicates if it is related to an all day.
 *
 * It will return a string representing the date converted to the given timezone. It will convert it to the local
 * timezone by default if no timezone argument is passed.
 *
 * The string will be localized following the locale setting of the user or the browser language as fallback
 */

const setDate = ({
	hours,
	minutes,
	days
}: {
	hours?: number;
	minutes?: number;
	days?: number;
}): number => {
	const date = new Date();
	if (days) {
		date.setDate(days);
	}
	if (hours) {
		date.setHours(hours);
	}
	if (minutes) {
		date.setMinutes(minutes);
	}
	return date.getTime();
};

describe('useGetDateRangeConvertedToTimezone', () => {
	beforeEach(() => {
		vi.setSystemTime(new Date('2022-01-01'));
	});
	const differentTimezone = 'Asia/Bangkok';
	describe('The output string', () => {
		it('will contain "all Day" if referring to an allDay event', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
				initialProps: [eventStart, eventEnd, { allDay: true }]
			});
			expect(result.current).toMatch(/all Day/i);
		});
		describe('will be formatted differently depending from the range difference between start and end', () => {
			test('minutes or hours range difference', () => {
				const eventStart = setDate({ hours: 2 });
				const eventEnd = setDate({ hours: 2, minutes: 30 });

				const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
					initialProps: [eventStart, eventEnd]
				});
				/* it is not depending on our code */
				// eslint-disable-next-line no-irregular-whitespace
				expect(result.current).toMatch('Saturday, January 01, 2022, 2:00 – 2:30 AM');
			});
			test('days or more (weeks, months, years) range difference', () => {
				const eventStart = setDate({ days: 2 });
				const eventEnd = setDate({ days: 3 });

				const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
					initialProps: [eventStart, eventEnd]
				});
				/* it is not depending on our code */
				// eslint-disable-next-line no-irregular-whitespace
				expect(result.current).toEqual(
					'Sunday, January 02, 2022 at 1:00 AM – Monday, January 03, 2022 at 1:00 AM GMT+01:00 Europe/Berlin'
				);
			});
		});
		it('will use the local timezone if no timezone option is passed', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
				initialProps: [eventStart, eventEnd]
			});
			expect(result.current).toMatch(/Europe\/Berlin/i);
		});
		it('will use the timezone when it is passed', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
				initialProps: [eventStart, eventEnd, { timeZone: differentTimezone }]
			});
			expect(result.current).toMatch(/Asia\/Bangkok/i);
		});
		it('will be localized following user preference', () => {
			shell.useUserSettings.mockReturnValueOnce({
				...defaultSettings,
				prefs: {
					...defaultSettings.prefs,
					zimbraPrefLocale: 'it'
				}
			});
			const eventStart = setDate({ days: 2 });
			const eventEnd = setDate({ days: 3 });

			const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
				initialProps: [eventStart, eventEnd]
			});
			expect(result.current).toMatch(
				'domenica 02 gennaio 2022 alle ore 01:00 – lunedì 03 gennaio 2022 alle ore 01:00 GMT+01:00 Europe/Berlin'
			);
		});
		it('will be localized following browser settings if user preferences are not available', () => {
			shell.useUserSettings.mockReturnValueOnce({
				...defaultSettings,
				prefs: {
					...defaultSettings.prefs,
					zimbraPrefLocale: undefined
				}
			});
			const browserLanguageGetter = vi.spyOn(window.navigator, 'language', 'get');
			browserLanguageGetter.mockReturnValueOnce('de');

			const eventStart = setDate({ days: 2 });
			const eventEnd = setDate({ days: 3 });

			const { result } = setupHook(useGetDateRangeConvertedToTimezone, {
				initialProps: [eventStart, eventEnd]
			});
			expect(result.current).toMatch(
				'Sonntag, 02. Januar 2022 um 01:00 – Montag, 03. Januar 2022 um 01:00 GMT+01:00 Europe/Berlin'
			);
		});
	});
});
