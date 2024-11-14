/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from 'react';

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
	const previousValue = useRef<string>('');
	const currentValue = JSON.stringify({ participants, startDateEpochMillis, endDateEpochMillis });

	useEffect(() => {
		const controller = new AbortController();
		const emails = participants.map((p) => p.email);
		if (participants.length > 0 && previousValue.current !== currentValue) {
			const { signal } = controller;
			const newNonWorkingHours: Record<string, NonWorkingHours> = {};
			previousValue.current = currentValue;
			getNonWorkingHoursRequest(
				{
					startEpochMillis: startDateEpochMillis,
					endEpochMillis: endDateEpochMillis,
					emails
				},
				signal
			)
				.then((response) => {
					response?.forEach((user) => {
						newNonWorkingHours[user.email] = {
							nonWorkingHours: user.nonWorkingHours?.map(mapFreeBusyToEvent) ?? []
						};
					});
					setParticipantsNonWorkingHours(newNonWorkingHours);
				})
				.catch(() => {
					setParticipantsNonWorkingHours({});
					previousValue.current = '';
				});
		}
		return () => {
			controller.abort();
		};
	}, [currentValue, endDateEpochMillis, participants, startDateEpochMillis]);

	return participantsNonWorkingHours;
}
