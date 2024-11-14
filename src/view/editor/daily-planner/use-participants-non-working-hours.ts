/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

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
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();

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
	}, [createSnackbar, currentValue, endDateEpochMillis, participants, startDateEpochMillis, t]);

	return participantsNonWorkingHours;
}
