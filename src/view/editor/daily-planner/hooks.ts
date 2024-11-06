/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';

type Event = {
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};
type ParticipantAvailability = {
	email: string;
	free: Event[];
	busy: Event[];
	tentative: Event[];
};
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
	return participantsAvailabilityList;
}
