/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';

import { useGetEventTimezoneString } from './use-get-event-timezone';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';

/* The useGetEventTimezone function is a utility hook which receive a start and end date with their relative timezone as parameters to convert them into local dates.
 * The output will be the original date range, the converted value into local, a boolean to indicates if a tooltip is needed and the relative tooltip to show.
 * Local and original dates parameters will be of type number, representing the unix timestamp in milliseconds.
 * Local and original dates output will be of type string, representing a human-readable date.
 * The tooltip will be shown only when local and original dates differs.
 * Tooltip will be returned into two different parameters, localTimezoneTooltip and eventTimezoneTooltip, depending if they are showing their local or original date */

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

describe('useGetEventTimezone', () => {
	const differentTimezone = 'Asia/Bangkok';
	const localTimezone = moment.tz.guess();
	describe('The human-readable date (both original or converted)', () => {
		test('it will contain "all Day" if referring to an allDay event', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { allDay: true, timeZone: localTimezone }]
			});
			expect(result.current.originalTimeString).toMatch(/all Day/i);
		});
		test('the human-readable date of the original date it will be defined', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
			});
			expect(result.current.originalTimeString).toBeDefined();
		});
		test('the timezone string of the original date will be defined', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
			});
			expect(result.current.originalTimezoneString).toBeDefined();
		});
		describe('it will be formatted differently depending from the range difference between start and end', () => {
			test('minutes or hours range difference', () => {
				const eventStart = setDate({ hours: 2 });
				const eventEnd = setDate({ hours: 2, minutes: 30 });

				const { result } = setupHook(useGetEventTimezoneString, {
					initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
				});
				/* it is not depending on our code */
				// eslint-disable-next-line no-irregular-whitespace
				expect(result.current.originalTimeString).toMatch(
					'Saturday, January 01, 2022, 2:00 – 2:30 AM'
				);
			});
			test('days or more (weeks, months, years) range difference', () => {
				const eventStart = setDate({ days: 2 });
				const eventEnd = setDate({ days: 3 });

				const { result } = setupHook(useGetEventTimezoneString, {
					initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
				});
				/* it is not depending on our code */
				// eslint-disable-next-line no-irregular-whitespace
				expect(result.current.originalTimeString).toMatch(
					'Sunday, January 02, 2022 at 1:00 AM – Monday, January 03, 2022 at 1:00 AM'
				);
			});
		});
	});
	describe('When the original timezone is equal to local timezone', () => {
		test('the timezone string of the original date will show the offSet from UTC in GMT for the original date', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
			});
			expect(result.current.originalTimezoneString).toMatch('GMT+01:00 Europe/Berlin');
			expect(result.current.timezoneStringConvertedToLocal).toBeUndefined();
		});
		test('the human-readable date different from the original will be undefined', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
			});
			expect(result.current.timeStringConvertedToLocal).toBeUndefined();
		});
		test('the human-readable timezone string different from the original will be undefined', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: localTimezone }]
			});
			expect(result.current.timezoneStringConvertedToLocal).toBeUndefined();
		});
	});
	describe('When the original timezone is different from the local timezone', () => {
		test('the human-readable date different from the original will be defined', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: differentTimezone }]
			});
			expect(result.current.timeStringConvertedToLocal).toBeDefined();
		});
		test('the human-readable timezone string different from the original will be defined', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: differentTimezone }]
			});
			expect(result.current.timezoneStringConvertedToLocal).toBeDefined();
		});
		test('the timezone string of the converted date will show the offSet from UTC in GMT of the local date', () => {
			const eventStart = setDate({ hours: 2 });
			const eventEnd = setDate({ hours: 3 });

			const { result } = setupHook(useGetEventTimezoneString, {
				initialProps: [eventStart, eventEnd, { timeZone: differentTimezone }]
			});
			expect(result.current.timezoneStringConvertedToLocal).toMatch('GMT+01:00 Europe/Berlin');
			expect(result.current.originalTimezoneString).toMatch('GMT+07:00 Asia/Bangkok');
		});
	});
});
