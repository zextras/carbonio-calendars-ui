/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';
import { find } from 'lodash';
import { useParams } from 'react-router-dom';

export const useSearchEvent = (appointmentsFromSearch) => {
	const { apptId, ridZ } = useParams();
	return useMemo(
		() =>
			find(
				appointmentsFromSearch,
				(appt) => appt?.resource?.id === apptId && appt?.resource?.ridZ === ridZ
			),
		[appointmentsFromSearch, apptId, ridZ]
	);
};
