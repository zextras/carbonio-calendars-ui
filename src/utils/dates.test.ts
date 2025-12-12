/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { applyTimezoneToLocalDate, parseDateFromICS, parseDateToICS } from './dates';

describe('dates utils', () => {
	describe('parseDateFromICS', () => {
		test('if icsString has length > 8 it will also parse hours, minutes and seconds', () => {
			vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('de');
			const result = parseDateFromICS('20241203T140342');
			expect(result).toEqual(expect.stringContaining('Tue Dec 03 2024 14:03:42 GMT+0100'));
		});
		test('if icsString has Z it will be converted in UTC date', () => {
			const result = parseDateFromICS('20241203T140342Z');
			expect(result).toEqual('Tue, 03 Dec 2024 13:03:42 GMT');
		});
		test('if icsString has length < 8 it wont parse hours, minutes and seconds and value them as 0', () => {
			const result = parseDateFromICS('20241203');
			expect(result).toEqual(expect.stringContaining('Tue Dec 03 2024 00:00:00 GMT+0100'));
		});
	});
	describe('parseDateToICS', () => {
		test('it will parse hours, minutes and seconds', () => {
			const result = parseDateToICS('Tue Dec 03 2024 14:03:42 GMT+0100');
			expect(result).toEqual('20241203T140342');
		});
		test('if date is UTC it will have Z', () => {
			const dateToParse = 'Tue, 03 Dec 2024 13:03:42 GMT';
			const result = parseDateToICS(dateToParse);
			expect(result).toEqual('20241203T140342Z');
		});
	});
	describe('applyTimezoneToLocalDate', () => {
		test('if a timezone is provided it will convert the date according to the given timezone', () => {
			const dateFromICS = 'Tue Dec 03 2024 14:03:42 GMT+0100';
			const convertedToTimezone = applyTimezoneToLocalDate(new Date(dateFromICS), 'Asia/Bangkok');
			expect(convertedToTimezone.toString()).toEqual(
				expect.stringContaining('Tue Dec 03 2024 08:03:42 GMT+0100')
			);
		});
		test('if a timezone is not provided it will keep the date unchanged according to the local timezone', () => {
			const dateFromICS = 'Tue Dec 03 2024 14:03:42 GMT+0100';
			const convertedToTimezone = applyTimezoneToLocalDate(new Date(dateFromICS));
			expect(convertedToTimezone.toString()).toEqual(
				expect.stringContaining('Tue Dec 03 2024 14:03:42 GMT+0100')
			);
		});
	});
});
