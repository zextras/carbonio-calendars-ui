/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

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
	const previousValue = useRef<string>('');
	const currentValue = JSON.stringify({ participants, startDateEpochMillis, endDateEpochMillis });
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const uids = participants.map((p) => p.email).join(',');

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;
		if (uids.length > 0 && previousValue.current !== currentValue) {
			previousValue.current = currentValue;
			const newAvailabilities: Record<string, ParticipantAvailability> = {};
			getFreeBusyRequest({ s: startDateEpochMillis, e: endDateEpochMillis, uid: uids }, signal)
				.then((response) => {
					if ('Fault' in response) {
						throw new Error('Error fetching free busy data');
					}
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
				})
				.catch(() => {
					setParticipantsAvailability({});
					createSnackbar({
						key: 'get-non-working-hours',
						replace: false,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
		}
		return () => {
			controller.abort();
		};
	}, [
		participants,
		startDateEpochMillis,
		endDateEpochMillis,
		participantsAvailability,
		uids,
		currentValue,
		createSnackbar,
		t
	]);

	return participantsAvailability;
}
