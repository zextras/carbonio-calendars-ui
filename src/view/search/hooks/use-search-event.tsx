/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';
import { find } from 'lodash';
import { useParams } from 'react-router-dom';
import { EventType } from '../../../types/event';

export const useSearchEvent = (appointmentsFromSearch: Array<EventType>): EventType | undefined => {
	const { apptId, ridZ } = useParams<{ apptId: string; ridZ: string }>();
	return useMemo(
		() =>
			find(
				appointmentsFromSearch,
				(appt) => appt?.resource?.id === apptId && appt?.resource?.ridZ === ridZ
			),
		[appointmentsFromSearch, apptId, ridZ]
	) as EventType;
};
