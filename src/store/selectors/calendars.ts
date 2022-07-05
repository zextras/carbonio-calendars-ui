/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, reduce, values } from 'lodash';
import { Calendar } from '../../types/store/calendars';
import { Store } from '../../types/store/store';

export function selectCalendar(state: Store, id: string): Calendar {
	return find(state?.calendars?.calendars, (item) => item.id === id) as Calendar;
}

export function selectCalendars(state: Store): Record<string, Calendar> {
	return state.calendars ? state.calendars.calendars : {};
}

export function selectCalendarsArray(state: Store): Array<Calendar> {
	return values?.(state?.calendars?.calendars) ?? [];
}

export function selectAllCalendars(state: Store): Array<Calendar> {
	return values?.(state?.calendars?.calendars) ?? [];
}

export function selectStatus(state: Store): string {
	return state?.invites?.status;
}

export function selectAllCheckedCalendarsQuery({ calendars }: Store): string {
	return reduce(
		filter(calendars?.calendars, 'checked'),
		(acc, c) => {
			acc.push(`inid:"${c.id}"`);
			return acc;
		},
		[] as Array<string>
	).join(' OR ');
}

export function selectUncheckedCalendars({ calendars }: Store): Array<Calendar> {
	return filter(calendars.calendars, ['checked', false]);
}

export function selectCheckedCalendars({ calendars }: Store): Array<Calendar> {
	return filter(calendars.calendars, ['checked', true]);
}

export function selectCheckedCalendarsMap({ calendars }: Store): Record<string, Calendar> {
	return reduce(
		filter(calendars.calendars, ['checked', true]),
		(acc, v) => ({
			...acc,
			[v.id]: v
		}),
		{}
	);
}

export function selectStart(state: Store): number {
	return state?.calendars?.start;
}

export function selectEnd(state: Store): number {
	return state?.calendars?.end;
}
