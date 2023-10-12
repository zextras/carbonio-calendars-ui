/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { find } from 'lodash';
import { useParams } from 'react-router-dom';

import { EventType } from '../types/event';

export const useSelectedEventFromArray = (eventsArray: Array<EventType>): EventType | undefined => {
	const { apptId, ridZ } = useParams<{ apptId: string; ridZ: string }>();
	return useMemo(
		() =>
			find(eventsArray, (appt) => appt?.resource?.id === apptId && appt?.resource?.ridZ === ridZ),
		[eventsArray, apptId, ridZ]
	) as EventType;
};
