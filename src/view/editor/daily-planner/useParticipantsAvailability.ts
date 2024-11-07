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

export type Participant = {
	email: string;
};

function mapFreeBusyToEvent(freeBusy: FreeBusy): Event {
	return {
		startDateEpochMillis: freeBusy.s,
		endDateEpochMillis: freeBusy.e
	};
}

export function useParticipantsAvailability({
	participants,
	startDateEpochMillis,
	endDateEpochMillis
}: {
	participants: Participant[];
	startDateEpochMillis: number;
	endDateEpochMillis: number;
}): Record<string, ParticipantAvailability> {
	const [participantsAvailability, setParticipantsAvailability] = useState<
		Record<string, ParticipantAvailability>
	>({});
	const uids = participants.map((p) => p.email).join(',');
	useEffect(() => {
		if (participants.length > 0) {
			const newAvailabilities: Record<string, ParticipantAvailability> = {};
			getFreeBusyRequest({ s: startDateEpochMillis, e: endDateEpochMillis, uid: uids }).then(
				(response) => {
					response?.usr?.forEach((user) => {
						newAvailabilities[user.id] = {
							free: user.f?.map(mapFreeBusyToEvent) ?? [],
							busy: user.b?.map(mapFreeBusyToEvent) ?? [],
							tentative: user.t?.map(mapFreeBusyToEvent) ?? []
						};
					});
					setParticipantsAvailability(newAvailabilities);
				}
			);
		}
	}, [uids, startDateEpochMillis, endDateEpochMillis, participants.length]);

	return participantsAvailability;
}
