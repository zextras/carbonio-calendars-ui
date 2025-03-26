/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { convertDateToTimezone, formatAppointmentRange, parseDateFromICS } from './dates';

const allDayLabel = 'all day';

describe('dates utils', () => {
	describe('parseDateFromICS', () => {
		test('if icsString has length > 8 it will also parse hours, minutes and seconds', () => {
			const result = parseDateFromICS('20241203T140342');
			expect(result).toMatch('Tue Dec 03 2024 14:03:42 GMT+0100');
		});
		test('if icsString has Z it will be converted in UTC date', () => {
			const result = parseDateFromICS('20241203T140342Z');
			expect(result).toMatch('Tue, 03 Dec 2024 13:03:42 GMT');
		});
		test('if icsString has length < 8 it wont parse hours, minutes and seconds and value them as 0', () => {
			const result = parseDateFromICS('20241203');
			expect(result).toMatch('Tue Dec 03 2024 00:00:00 GMT+0100');
		});
	});
	describe('formatAppointmentRange', () => {
		describe('given two dates, a string will be returned representing the duration range', () => {
			test('If timezone is not valued, it will be converted to local', async () => {
				const result = formatAppointmentRange({
					start: 1710750600000,
					end: 1710752400000,
					allDay: false,
					allDayLabel
				});

				expect(result).toEqual('Monday, March 18, 2024, 9:30\u2009–\u200910:00\u202fAM GMT+1');
			});
			test('If timezone is valued, it will be converted to that timezone', () => {
				const result = formatAppointmentRange({
					start: 1710750600000,
					end: 1710752400000,
					allDay: false,
					timezone: 'Asia/Kolkata',
					allDayLabel
				});

				expect(result).toEqual('Monday, March 18, 2024, 2:00\u2009–\u20092:30\u202fPM GMT+5:30');
			});
			test('If it is an all Day, allDayLabel will be shown in the string', () => {
				const result = formatAppointmentRange({
					start: 1710750600000,
					end: 1710752400000,
					allDay: true,
					allDayLabel
				});

				expect(result).toEqual(expect.stringMatching(allDayLabel));
			});
			test('If it is an all Day, hours or gmt are not shown in the string', () => {
				const result = formatAppointmentRange({
					start: 1710750600000,
					end: 1710752400000,
					allDay: true,
					allDayLabel
				});

				expect(result).toEqual(expect.not.stringMatching('9:30\u2009–\u200910:00\u202fAM GMT+1'));
			});
			test('internal options can be overwritten from outside', () => {
				const result = formatAppointmentRange({
					start: 1710750600000,
					end: 1710752400000,
					allDay: false,
					allDayLabel,
					intlOptions: {
						timeZoneName: 'longGeneric'
					}
				});

				expect(result).toEqual(
					'Monday, March 18, 2024, 9:30\u2009–\u200910:00\u202fAM Germany Time'
				);
			});
		});
	});
	describe('convertDateToTimezone', () => {
		test('if a timezone is provided it will convert the date according to the given timezone', () => {
			const dateFromICS = parseDateFromICS('20241203T140342');
			const convertedToTimezone = convertDateToTimezone(new Date(dateFromICS), 'Asia/Bangkok');
			expect(convertedToTimezone.toString()).toMatch('Tue Dec 03 2024 08:03:42 GMT+0100');
		});
		test('if a timezone is not provided it will convert the date according to the local timezone', () => {
			const dateFromICS = parseDateFromICS('20241203T140342');
			const convertedToTimezone = convertDateToTimezone(new Date(dateFromICS));
			expect(convertedToTimezone.toString()).toMatch('Tue Dec 03 2024 14:03:42 GMT+0100');
		});
	});
});
