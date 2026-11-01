/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { groupBy, map, sortBy } from 'lodash';

import { CALENDAR_ROUTE } from '../../constants';
import { EVENT_ACTIONS } from '../../constants/event-actions';
import type { EventType } from '../../types/event';

export type AccountEvents = {
	account: string;
	isOwn: boolean;
	events: Array<EventType>;
};

/** "1h 30m", "45m", "2h" */
export const formatDuration = (durationMs: number): string => {
	const totalMinutes = Math.max(0, Math.round(durationMs / 60000));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return [hours ? `${hours}h` : '', minutes || !hours ? `${minutes}m` : '']
		.filter(Boolean)
		.join(' ');
};

/**
 * Groups the events by the account owning the calendar: the shared calendars carry the
 * owner's address, the others belong to the logged user. The logged user comes first.
 */
export const groupEventsByAccount = (
	events: Array<EventType>,
	userAccountName: string
): Array<AccountEvents> => {
	const byAccount = groupBy(events, (event) => event.resource.calendar.owner ?? userAccountName);
	return sortBy(
		map(byAccount, (accountEvents, account) => ({
			account,
			isOwn: account === userAccountName,
			// all day events first, then by start time
			events: sortBy(accountEvents, [
				(e): number => (e.allDay ? 0 : 1),
				(e): number => e.start.getTime()
			])
		})),
		(group) => (group.isOwn ? 0 : 1),
		'account'
	);
};

export const getEventPath = (event: EventType): string =>
	[
		'',
		CALENDAR_ROUTE,
		event.resource.calendar.id,
		EVENT_ACTIONS.EXPAND,
		event.resource.id,
		event.resource.ridZ
	]
		.filter((segment, index) => index === 0 || !!segment)
		.join('/');
