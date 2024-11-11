/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef } from 'react';

import { FreeBusy } from '../../../soap/get-free-busy-request';
import { getWorkingHoursRequest } from '../../../soap/get-working-hours-request';

type Event = {
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};

export type WorkingHours = {
	workingHours: Event[];
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

export function useParticipantsWorkingHours({
	participants,
	startDateEpochMillis,
	endDateEpochMillis
}: {
	participants: Participant[];
	startDateEpochMillis: number;
	endDateEpochMillis: number;
}): Record<string, WorkingHours> {
	const participantsWorkingHours = useRef<Record<string, WorkingHours>>({});
	useEffect(() => {
		if (participants.length > 0) {
			const newWorkingHours: Record<string, WorkingHours> = {};
			getWorkingHoursRequest({
				startEpochMillis: startDateEpochMillis,
				endEpochMillis: endDateEpochMillis,
				emails: participants.map((p) => p.email)
			}).then((response) => {
				response?.forEach((user) => {
					newWorkingHours[user.id] = {
						workingHours: user.workingHours?.map(mapFreeBusyToEvent) ?? []
					};
				});
				participantsWorkingHours.current = newWorkingHours;
			});
		}
	}, [endDateEpochMillis, participants, startDateEpochMillis, participants.length]);

	return participantsWorkingHours.current;
}
