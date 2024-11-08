/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { FreeBusy } from '../../../soap/get-free-busy-request';
import { getWorkingHoursRequest } from '../../../soap/get-working-hours-request';

type Event = {
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};

export type WorkingHours = {
	id: string;
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
	const [participantsWokringHours, setParticipantsWorkingHours] = useState<
		Record<string, WorkingHours>
	>({});
	useEffect(() => {
		if (participants.length > 0) {
			const workingHours: Record<string, WorkingHours> = {};
			getWorkingHoursRequest({
				s: startDateEpochMillis,
				e: endDateEpochMillis,
				name: participants.map((p) => p.email)
			}).then((response) => {
				response?.forEach((user) => {
					workingHours[user.id] = {
						id: user.id,
						workingHours: user.workingHours?.map(mapFreeBusyToEvent) ?? []
					};
				});
				setParticipantsWorkingHours(workingHours);
			});
		}
	}, [startDateEpochMillis, endDateEpochMillis, participants.length, participants]);

	return participantsWokringHours;
}
