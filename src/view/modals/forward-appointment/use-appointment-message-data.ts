/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { getMessageRequest } from 'soap/get-message-request';
import { MessageData } from 'view/modals/forward-appointment/types';

type UseAppointmentMessageDataParams = {
	inviteId?: string;
	ridZ?: string;
};

export const useAppointmentMessageData = ({
	inviteId,
	ridZ
}: UseAppointmentMessageDataParams): MessageData | null => {
	const [messageData, setMessageData] = useState<MessageData | null>(null);

	useEffect(() => {
		const fetchMessageData = async (): Promise<void> => {
			if (!inviteId) return;

			try {
				const response = await getMessageRequest({
					inviteId,
					ridZ
				});

				if (response && !('error' in response) && response.m) {
					setMessageData(response.m[0]);
				}
			} catch (error) {
				console.error('Failed to fetch message data:', error);
			}
		};

		fetchMessageData();
	}, [inviteId, ridZ]);

	return messageData;
};
