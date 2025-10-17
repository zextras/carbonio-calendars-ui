/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { ContactInputItem } from '@zextras/carbonio-ui-commons';

import { MessagePart } from './message-parts-builder';
import { forwardAppointmentRequest } from 'soap/forward-appointment-request';

type UseForwardAppointmentParams = {
	eventId: string;
	onSuccess: () => void;
	onError: () => void;
	onComplete: () => void;
};

type ForwardAppointmentHandler = (
	contacts: ContactInputItem[],
	messageParts: MessagePart[]
) => Promise<void>;

export const useForwardAppointment = ({
	eventId,
	onSuccess,
	onError,
	onComplete
}: UseForwardAppointmentParams): ForwardAppointmentHandler =>
	useCallback(
		async (contacts: ContactInputItem[], messageParts: MessagePart[]): Promise<void> => {
			try {
				const response = await forwardAppointmentRequest({
					id: eventId,
					attendees: contacts.map((contact) => contact.value.email),
					messageParts
				});

				if (!response || 'Fault' in response) {
					onError();
					return;
				}

				onSuccess();
			} catch {
				onError();
			} finally {
				onComplete();
			}
		},
		[eventId, onSuccess, onError, onComplete]
	);
