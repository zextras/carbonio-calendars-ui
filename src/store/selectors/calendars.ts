/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, reduce, values } from 'lodash';
import { Calendar } from '../../types/store/calendars';
import type { RootState } from '../redux';

export const selectCalendar =
	(id: string | undefined): ((state: RootState) => Calendar | undefined) =>
	(state: RootState): Calendar | undefined =>
		find(state?.calendars?.calendars, ['id', id]);

export function selectCalendars(state: RootState): Record<string, Calendar> {
	return state.calendars ? state.calendars.calendars : {};
}

export function selectCalendarsArray(state: RootState): Array<Calendar> {
	return values?.(state?.calendars?.calendars) ?? [];
}

export function selectAllCalendars(state: RootState): Array<Calendar> {
	return values?.(state?.calendars?.calendars) ?? [];
}

export function selectStatus(state: RootState): string {
	return state?.invites?.status;
}

export function selectAllCheckedCalendarsQuery({ calendars }: RootState): string {
	const calendarsArr = filter(
		values<Calendar>(calendars?.calendars),
		(f) => f.checked && !f.broken
	);
	return reduce(
		calendarsArr,
		(acc, c, id) => (id === 0 ? `inid:"${c.id}"` : `${acc} OR inid:"${c.id}"`),
		''
	);
}

export function selectUncheckedCalendars({ calendars }: RootState): Array<Calendar> {
	return filter(calendars?.calendars, ['checked', false]);
}

export function selectCheckedCalendars({ calendars }: RootState): Array<Calendar> {
	return filter(calendars?.calendars, ['checked', true]);
}

export function selectCheckedCalendarsMap({ calendars }: RootState): Record<string, Calendar> {
	return reduce(
		filter(calendars?.calendars, ['checked', true]),
		(acc, v) => ({
			...acc,
			[v.id]: v
		}),
		{}
	);
}

export function selectStart(state: RootState): number {
	return state?.calendars?.start;
}

export function selectEnd(state: RootState): number {
	return state?.calendars?.end;
}
