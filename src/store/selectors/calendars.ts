/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder } from '@zextras/carbonio-shell-ui';
import { filter, find, reduce, values } from 'lodash';
import { Calendar } from '../../types/store/calendars';
import { Store } from '../../types/store/store';

export const selectCalendar =
	(id: string | undefined): ((state: Store) => Calendar | undefined) =>
	(state: Store): Calendar | undefined =>
		find(state?.calendars?.calendars, ['id', id]);

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

export function selectUncheckedCalendars({ calendars }: Store): Array<Calendar> {
	return filter(calendars?.calendars, ['checked', false]);
}

export function selectCheckedCalendars({ calendars }: Store): Array<Calendar> {
	return filter(calendars?.calendars, ['checked', true]);
}

export function selectCheckedCalendarsMap({ calendars }: Store): Record<string, Calendar> {
	return reduce(
		filter(calendars?.calendars, ['checked', true]),
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
