/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { DailyPlannerParticipantType } from './types';
import { FreeBusy, getFreeBusyRequest } from '../../../soap/get-free-busy-request';

type Event = {
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};

export type ParticipantAvailability = {
	free: Event[];
	busy: Event[];
	tentative: Event[];
	outOfOffice: Event[];
	unknown: Event[];
};

export type Participant = {
	email: string;
	fullName?: string;
	type: DailyPlannerParticipantType;
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
	participants: Array<{ email: string }>;
	startDateEpochMillis: number;
	endDateEpochMillis: number;
}): Record<string, ParticipantAvailability> {
	const [participantsAvailability, setParticipantsAvailability] = useState<
		Record<string, ParticipantAvailability>
	>({});
	const uids = participants.map((p) => p.email).join(',');
	useEffect(() => {
		if (uids.length > 0) {
			const newAvailabilities: Record<string, ParticipantAvailability> = {};
			getFreeBusyRequest({ s: startDateEpochMillis, e: endDateEpochMillis, uid: uids }).then(
				(response) => {
					response?.usr?.forEach((user) => {
						newAvailabilities[user.id] = {
							free: user.f?.map(mapFreeBusyToEvent) ?? [],
							busy: user.b?.map(mapFreeBusyToEvent) ?? [],
							tentative: user.t?.map(mapFreeBusyToEvent) ?? [],
							outOfOffice: user.u?.map(mapFreeBusyToEvent) ?? [],
							unknown: user.n?.map(mapFreeBusyToEvent) ?? []
						};
					});
					setParticipantsAvailability(newAvailabilities);
				}
			);
		}
	}, [endDateEpochMillis, startDateEpochMillis, uids]);

	return participantsAvailability;
}
