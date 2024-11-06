/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { FreeBusy, getFreeBusyRequest } from '../../../soap/get-free-busy-request';

type Event = {
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};
export type ParticipantAvailability = {
	free: Event[];
	busy: Event[];
	tentative: Event[];
};
type Email = string;

function mapFreeBusyToEvent(freeBusy: FreeBusy): Event {
	return {
		startDateEpochMillis: freeBusy.s,
		endDateEpochMillis: freeBusy.e
	};
}
export function useParticipantsAvailability({
	participants
}: {
	participants: { email: string }[];
}): Record<Email, ParticipantAvailability> {
	const [participantsAvailability, setParticipantsAvailability] = useState<
		Record<Email, ParticipantAvailability>
	>({});
	const uids = participants.map((p) => p.email).join(',');
	useEffect(() => {
		const today = new Date();
		const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDay(), 0, 0, 0);
		const endOfDay = new Date(startOfDay.getDate() + 1);

		getFreeBusyRequest({ s: startOfDay.getTime(), e: endOfDay.getTime(), uid: uids }).then(
			(response) => {
				response?.usr?.forEach((user) => {
					participantsAvailability[user.id] = {
						free: user.f?.map(mapFreeBusyToEvent) ?? [],
						busy: user.b?.map(mapFreeBusyToEvent) ?? [],
						tentative: user.t?.map(mapFreeBusyToEvent) ?? []
					};
				});
				setParticipantsAvailability(participantsAvailability);
			}
		);
	}, [uids, participantsAvailability]);

	return participantsAvailability;
}
