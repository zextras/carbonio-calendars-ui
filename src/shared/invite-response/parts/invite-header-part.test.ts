/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DEFAULT_EVENT_DURATION_MS, getInviteEndTime } from './invite-header-part';

describe('getInviteEndTime', () => {
	const start = 1_722_427_200_000; // 2024-07-31T12:00:00.000Z

	it('defaults a missing DTEND/DURATION to a 1-hour block, mirroring Thunderbird', () => {
		expect(getInviteEndTime(start, undefined, false)).toBe(start + DEFAULT_EVENT_DURATION_MS);
	});

	it('defaults a zero-duration DTEND (RFC 5545 §3.6.1, DTEND === DTSTART) to a 1-hour block', () => {
		expect(getInviteEndTime(start, start, false)).toBe(start + DEFAULT_EVENT_DURATION_MS);
	});

	it('defaults an invalid DTEND before DTSTART to a 1-hour block', () => {
		expect(getInviteEndTime(start, start - 1000, false)).toBe(start + DEFAULT_EVENT_DURATION_MS);
	});

	it('keeps an explicit end time untouched when it is after the start', () => {
		const explicitEnd = start + 30 * 60 * 1000; // 30-minute meeting
		expect(getInviteEndTime(start, explicitEnd, false)).toBe(explicitEnd);
	});

	it('does not force a 1-hour block on all-day events missing an end', () => {
		expect(getInviteEndTime(start, undefined, true)).toBe(start);
	});

	it('keeps an explicit all-day end time untouched even if it equals the start', () => {
		expect(getInviteEndTime(start, start, true)).toBe(start);
	});
});
