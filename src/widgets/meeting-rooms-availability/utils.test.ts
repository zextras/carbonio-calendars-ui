/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addHours, addMinutes } from 'date-fns';

import {
	deserializeConfig,
	getCenteredScrollLeft,
	getDayHours,
	getSlotStatus,
	serializeConfig,
	type RoomAvailability
} from './utils';

const availability = (partial: Partial<RoomAvailability>): RoomAvailability => ({
	busy: [],
	tentative: [],
	unavailable: [],
	unknown: [],
	...partial
});

describe('meeting rooms availability utils', () => {
	describe('config', () => {
		it('round-trips a config', () => {
			const config = { rooms: [{ email: 'a@x.com', label: 'A' }] };
			expect(deserializeConfig(serializeConfig(config))).toEqual(config);
		});

		it.each([
			[undefined],
			[{ v: 99, data: '{}' }],
			[{ v: 1, data: 'not json' }],
			[{ v: 1, data: '{"rooms": 3}' }]
		])('returns the default config on invalid input %#', (input) => {
			expect(deserializeConfig(input)).toEqual({ rooms: [] });
		});

		it('drops invalid and duplicated rooms', () => {
			const data = JSON.stringify({
				rooms: [
					{ email: 'a@x.com', label: 'A' },
					{ email: 'a@x.com', label: 'A again' },
					{ email: '', label: 'no email' },
					null
				]
			});
			expect(deserializeConfig({ v: 1, data }).rooms).toEqual([{ email: 'a@x.com', label: 'A' }]);
		});
	});

	describe('getDayHours', () => {
		it('returns 24 hours on a regular day', () => {
			expect(getDayHours(new Date(2026, 10, 5, 15))).toHaveLength(24);
		});
	});

	describe('getSlotStatus', () => {
		const slot = new Date(2026, 10, 5, 10);
		const range = (from: Date, to: Date): { s: number; e: number } => ({
			s: from.getTime(),
			e: to.getTime()
		});

		it('is unknown without data', () => {
			expect(getSlotStatus(undefined, slot)).toBe('unknown');
		});

		it('is free without overlapping ranges', () => {
			const busy = [range(addHours(slot, 1), addHours(slot, 2))];
			expect(getSlotStatus(availability({ busy }), slot)).toBe('free');
		});

		it('is busy on a partial overlap', () => {
			const busy = [range(addMinutes(slot, 30), addHours(slot, 2))];
			expect(getSlotStatus(availability({ busy }), slot)).toBe('busy');
		});

		it('gives priority to busy over tentative', () => {
			const r = [range(slot, addHours(slot, 1))];
			expect(getSlotStatus(availability({ busy: r, tentative: r }), slot)).toBe('busy');
			expect(getSlotStatus(availability({ tentative: r }), slot)).toBe('tentative');
		});
	});

	describe('getCenteredScrollLeft', () => {
		it('centers the slot and never goes negative', () => {
			expect(getCenteredScrollLeft({ index: 10, slotWidth: 60, viewportWidth: 300 })).toBe(480);
			expect(getCenteredScrollLeft({ index: 0, slotWidth: 60, viewportWidth: 300 })).toBe(0);
		});
	});
});
