/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { formatDuration, getEventPath, groupEventsByAccount } from './utils';
import type { EventType } from '../../types/event';

const makeEvent = (id: string, startHour: number, owner?: string, allDay = false): EventType =>
	({
		id,
		title: id,
		allDay,
		start: new Date(2026, 10, 1, startHour),
		end: new Date(2026, 10, 1, startHour + 1),
		resource: { id, ridZ: '20261101T090000Z', calendar: { id: '10', owner } }
	}) as unknown as EventType;

describe('today appointments widget utils', () => {
	describe('formatDuration', () => {
		it.each([
			[45 * 60000, '45m'],
			[2 * 3600000, '2h'],
			[90 * 60000, '1h 30m']
		])('formats %d ms as %s', (ms, expected) => {
			expect(formatDuration(ms)).toBe(expected);
		});
	});

	describe('groupEventsByAccount', () => {
		it('puts the logged user first and sorts events by start, all day first', () => {
			const groups = groupEventsByAccount(
				[
					makeEvent('b', 11),
					makeEvent('shared', 8, 'other@example.com'),
					makeEvent('a', 9),
					makeEvent('allday', 0, undefined, true)
				],
				'me@example.com'
			);
			expect(groups.map((g) => g.account)).toEqual(['me@example.com', 'other@example.com']);
			expect(groups[0].events.map((e) => e.id)).toEqual(['allday', 'a', 'b']);
		});
	});

	it('builds the path opening the displayer on the appointment', () => {
		expect(getEventPath(makeEvent('42', 9))).toBe('/calendars/10/expand/42/20261101T090000Z');
	});
});
