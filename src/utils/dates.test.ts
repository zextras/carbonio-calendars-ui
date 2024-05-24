/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { formatAppointmentRange } from './dates';

const allDayLabel = 'all day';

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
				inOptions: {
					timeZoneName: 'longGeneric'
				}
			});

			expect(result).toEqual('Monday, March 18, 2024, 9:30\u2009–\u200910:00\u202fAM Italy Time');
		});
	});
});
