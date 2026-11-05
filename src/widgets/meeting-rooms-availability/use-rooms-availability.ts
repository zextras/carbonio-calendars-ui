/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useMemo, useState } from 'react';

import { endOfDay, startOfDay } from 'date-fns';
import { forEach, map } from 'lodash';

import type { RoomAvailability } from './utils';
import { getFreeBusyRequest } from '../../soap/get-free-busy-request';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export type RoomsAvailability = {
	/** Availability by room email. Undefined while loading. */
	byEmail: Record<string, RoomAvailability> | undefined;
	error: boolean;
};

/** Free/busy of the given rooms for the whole day. */
export const useRoomsAvailability = (emails: Array<string>, day: Date): RoomsAvailability => {
	const [state, setState] = useState<RoomsAvailability>({ byEmail: undefined, error: false });
	const [tick, setTick] = useState(0);
	const uid = useMemo(() => emails.join(','), [emails]);
	const dayStart = startOfDay(day).getTime();
	const dayEnd = endOfDay(day).getTime();

	useEffect(() => {
		const id = setInterval(() => setTick((v) => v + 1), REFRESH_INTERVAL_MS);
		return (): void => clearInterval(id);
	}, []);

	// show the loading state when the day or the rooms change (not on a silent refresh)
	useEffect(() => {
		setState({ byEmail: undefined, error: false });
	}, [uid, dayStart]);

	useEffect(() => {
		if (!uid) {
			setState({ byEmail: {}, error: false });
			return undefined;
		}
		const controller = new AbortController();
		getFreeBusyRequest({ s: dayStart, e: dayEnd, uid }, controller.signal)
			.then((response) => {
				if (controller.signal.aborted) return;
				if (!response || 'Fault' in response) {
					setState({ byEmail: undefined, error: true });
					return;
				}
				const byEmail: Record<string, RoomAvailability> = {};
				forEach(response.usr, (user) => {
					byEmail[user.id] = {
						busy: user.b ?? [],
						tentative: user.t ?? [],
						unavailable: user.u ?? [],
						unknown: user.n ?? []
					};
				});
				setState({ byEmail, error: false });
			})
			.catch(() => {
				if (!controller.signal.aborted) setState({ byEmail: undefined, error: true });
			});
		return (): void => controller.abort();
	}, [uid, dayStart, dayEnd, tick]);

	return state;
};

export const getRoomEmails = (rooms: Array<{ email: string }>): Array<string> =>
	map(rooms, 'email');
