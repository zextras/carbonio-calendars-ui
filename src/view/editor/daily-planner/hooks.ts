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
	email: string;
	free: Event[];
	busy: Event[];
	tentative: Event[];
};

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
}): ParticipantAvailability[] {
	const initialAvailabilities: ParticipantAvailability[] = participants.map((participant) => ({
		email: participant.email,
		free: [],
		tentative: [],
		busy: []
	}));

	const [participantsAvailabilityList, setParticipantsAvailabilityList] =
		useState<ParticipantAvailability[]>(initialAvailabilities);
	useEffect(() => {
		const today = new Date();
		const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDay(), 0, 0, 0);
		const endOfDay = new Date(startOfDay.getDate() + 1);
		const availabilitySoapResponseRecord: Record<string, ParticipantAvailability> = {};
		getFreeBusyRequest({ s: startOfDay.getTime(), e: endOfDay.getTime(), uid: '1' }).then(
			(response) => {
				response?.usr?.forEach((user) => {
					availabilitySoapResponseRecord[user.id] = {
						email: user.id,
						free: user.f?.map(mapFreeBusyToEvent) ?? [],
						busy: user.b?.map(mapFreeBusyToEvent) ?? [],
						tentative: user.t?.map(mapFreeBusyToEvent) ?? []
					};
				});
			}
		);
		participantsAvailabilityList.map(
			(participant) => availabilitySoapResponseRecord?.[participant.email]
		);
	}, [participants, participantsAvailabilityList]);

	return participantsAvailabilityList;
}
