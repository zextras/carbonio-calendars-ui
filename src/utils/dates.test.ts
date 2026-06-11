/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { applyTimezoneToLocalDate, parseDateFromICS, parseDateToICS } from './dates';

describe('dates utils', () => {
	describe('parseDateFromICS', () => {
		test('if icsString has length > 8 it will also parse hours, minutes and seconds', () => {
			const result = parseDateFromICS('20241203T140342');
			expect(result).toBeInstanceOf(Date);
			expect(result.getFullYear()).toBe(2024);
			expect(result.getMonth()).toBe(11); // December (0-indexed)
			expect(result.getDate()).toBe(3);
			expect(result.getHours()).toBe(14);
			expect(result.getMinutes()).toBe(3);
			expect(result.getSeconds()).toBe(42);
		});
		test('if icsString has Z it will be converted in UTC date', () => {
			const result = parseDateFromICS('20241203T140342Z');
			expect(result).toBeInstanceOf(Date);
			// The function builds new Date(year, month, day, h, m, s) as local time then
			// extracts UTC components — mirror that construction to stay timezone-agnostic.
			const localDate = new Date(2024, 11, 3, 14, 3, 42);
			const expected = new Date(
				Date.UTC(
					localDate.getUTCFullYear(),
					localDate.getUTCMonth(),
					localDate.getUTCDate(),
					localDate.getUTCHours(),
					localDate.getUTCMinutes(),
					localDate.getUTCSeconds()
				)
			);
			expect(result.getTime()).toBe(expected.getTime());
		});
		test('if icsString has length < 8 it wont parse hours, minutes and seconds and value them as 0', () => {
			const result = parseDateFromICS('20241203');
			expect(result).toBeInstanceOf(Date);
			expect(result.getFullYear()).toBe(2024);
			expect(result.getMonth()).toBe(11); // December (0-indexed)
			expect(result.getDate()).toBe(3);
			expect(result.getHours()).toBe(0);
			expect(result.getMinutes()).toBe(0);
			expect(result.getSeconds()).toBe(0);
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
