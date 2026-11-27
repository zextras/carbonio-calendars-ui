/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDate, getMonth, getYear, isValid } from 'date-fns';

import { parseRecurrenceUntil } from 'view/editor/parts/recurrence/views/recurrence-until-utils';

const FALLBACK = new Date(2026, 0, 5, 9, 0, 0);

describe('parseRecurrenceUntil', () => {
	it('should return the fallback when until is undefined', () => {
		expect(parseRecurrenceUntil(undefined, FALLBACK)).toBe(FALLBACK);
	});

	it('should parse a date-only value', () => {
		const result = parseRecurrenceUntil('20260204', FALLBACK);
		expect([getYear(result), getMonth(result), getDate(result)]).toEqual([2026, 1, 4]);
	});

	it('should parse a UTC date-time value returned by the server', () => {
		const result = parseRecurrenceUntil('20260204T090000Z', FALLBACK);
		expect(isValid(result)).toBe(true);
		expect(result.toISOString()).toBe('2026-02-04T09:00:00.000Z');
	});

	it('should return the fallback when the value is not parsable', () => {
		expect(parseRecurrenceUntil('not-a-date', FALLBACK)).toBe(FALLBACK);
	});
});
