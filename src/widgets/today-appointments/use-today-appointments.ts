/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useMemo, useState } from 'react';

import { FOLDERS, hasId, LinkFolder, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { endOfDay, startOfDay } from 'date-fns';
import { filter, map, values } from 'lodash';

import { normalizeAppointments } from '../../normalizations/normalize-appointments';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch } from '../../store/redux/hooks';
import type { EventType } from '../../types/event';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/** Today's appointments of every calendar of every account. Undefined while loading. */
export const useTodayAppointments = (): Array<EventType> | undefined => {
	const dispatch = useAppDispatch();
	const calendars = useFoldersMap();
	const [events, setEvents] = useState<Array<EventType> | undefined>(undefined);
	const [tick, setTick] = useState(0);

	useEffect(() => {
		const id = setInterval(() => setTick((t) => t + 1), REFRESH_INTERVAL_MS);
		return (): void => clearInterval(id);
	}, []);

	const query = useMemo(
		() =>
			map(
				filter(
					calendars,
					(calendar) =>
						!/b/.test(calendar?.f ?? '') &&
						!(calendar as LinkFolder).broken &&
						!hasId({ id: calendar.id }, FOLDERS.TRASH)
				),
				(calendar) => `inid:"${calendar.id}"`
			).join(' OR '),
		[calendars]
	);

	useEffect(() => {
		if (!query) {
			return undefined;
		}
		let cancelled = false;
		const now = new Date();
		dispatch(
			searchAppointments({
				spanStart: startOfDay(now).getTime(),
				spanEnd: endOfDay(now).getTime(),
				query
			})
		).then((response) => {
			if (cancelled) return;
			const appts = response?.payload?.appt;
			setEvents(
				appts?.length
					? normalizeCalendarEvents(values(normalizeAppointments(appts)), calendars)
					: []
			);
		});
		return (): void => {
			cancelled = true;
		};
	}, [calendars, dispatch, query, tick]);

	return events;
};
