/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { eachHourOfInterval, endOfDay, startOfDay } from 'date-fns';
import { filter, isArray, isString, uniqBy } from 'lodash';

import type { FreeBusy } from '../../soap/get-free-busy-request';
import type { SerializedWidgetConfig } from '../../types/dashboard-widget';

export type MeetingRoom = { email: string; label: string };

export type MeetingRoomsAvailabilityConfig = { rooms: Array<MeetingRoom> };

export const DEFAULT_CONFIG: MeetingRoomsAvailabilityConfig = { rooms: [] };

export const CONFIG_VERSION = 1;

export const serializeConfig = (
	config: MeetingRoomsAvailabilityConfig
): SerializedWidgetConfig => ({
	v: CONFIG_VERSION,
	data: JSON.stringify(config)
});

/** Never throws: on invalid input it returns the default config */
export const deserializeConfig = (
	serialized: SerializedWidgetConfig | undefined
): MeetingRoomsAvailabilityConfig => {
	if (!serialized || serialized.v !== CONFIG_VERSION) return DEFAULT_CONFIG;
	try {
		const parsed = JSON.parse(serialized.data);
		if (!isArray(parsed?.rooms)) return DEFAULT_CONFIG;
		const rooms = filter(
			parsed.rooms,
			(room): room is MeetingRoom =>
				isString(room?.email) && !!room.email.trim() && isString(room?.label)
		).map(({ email, label }) => ({ email, label }));
		return { rooms: uniqBy(rooms, 'email') };
	} catch {
		return DEFAULT_CONFIG;
	}
};

export type SlotStatus = 'free' | 'tentative' | 'busy' | 'unavailable' | 'unknown';

export type RoomAvailability = {
	busy: Array<FreeBusy>;
	tentative: Array<FreeBusy>;
	unavailable: Array<FreeBusy>;
	unknown: Array<FreeBusy>;
};

/** Every hour of the day of the given date (23/25 of them on DST change days) */
export const getDayHours = (day: Date): Array<Date> =>
	eachHourOfInterval({ start: startOfDay(day), end: endOfDay(day) });

const overlaps = (ranges: Array<FreeBusy>, start: number, end: number): boolean =>
	ranges.some((range) => range.s < end && range.e > start);

/** Status of a room in the [start, start + 1h) slot. The most restrictive status wins. */
export const getSlotStatus = (
	availability: RoomAvailability | undefined,
	slotStart: Date
): SlotStatus => {
	if (!availability) return 'unknown';
	const start = slotStart.getTime();
	const end = start + 60 * 60 * 1000;
	if (overlaps(availability.busy, start, end)) return 'busy';
	if (overlaps(availability.unavailable, start, end)) return 'unavailable';
	if (overlaps(availability.tentative, start, end)) return 'tentative';
	if (overlaps(availability.unknown, start, end)) return 'unknown';
	return 'free';
};

/** Scroll offset that centers the given slot in the scrollable area */
export const getCenteredScrollLeft = ({
	index,
	slotWidth,
	viewportWidth
}: {
	index: number;
	slotWidth: number;
	viewportWidth: number;
}): number => Math.max(0, index * slotWidth + slotWidth / 2 - viewportWidth / 2);
