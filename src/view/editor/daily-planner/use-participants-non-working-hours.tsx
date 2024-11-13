/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { FreeBusy } from '../../../soap/get-free-busy-request';
import { getNonWorkingHoursRequest } from '../../../soap/get-non-working-hours-request';

type Event = {
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};

export type NonWorkingHours = {
	nonWorkingHours: Event[];
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

export function useParticipantsNonWorkingHours({
	participants,
	startDateEpochMillis,
	endDateEpochMillis
}: {
	participants: Array<{ email: string }>;
	startDateEpochMillis: number;
	endDateEpochMillis: number;
}): Record<string, NonWorkingHours> {
	const [participantsNonWorkingHours, setParticipantsNonWorkingHours] = useState<
		Record<string, NonWorkingHours>
	>({});

	useEffect(() => {
		if (participants.length > 0) {
			const newNonWorkingHours: Record<string, NonWorkingHours> = {};
			getNonWorkingHoursRequest({
				startEpochMillis: startDateEpochMillis,
				endEpochMillis: endDateEpochMillis,
				emails: participants.map((p) => p.email)
			}).then((response) => {
				response?.forEach((user) => {
					newNonWorkingHours[user.email] = {
						nonWorkingHours: user.nonWorkingHours?.map(mapFreeBusyToEvent) ?? []
					};
				});
				setParticipantsNonWorkingHours(newNonWorkingHours);
			});
		}
	}, [participants, startDateEpochMillis, endDateEpochMillis]);

	return participantsNonWorkingHours;
}
