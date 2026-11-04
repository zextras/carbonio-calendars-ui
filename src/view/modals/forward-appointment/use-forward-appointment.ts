/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { ContactInputItem } from '@zextras/carbonio-ui-commons';
import { SoapFault } from '@zextras/carbonio-ui-soap-lib';

import { MessagePart } from './message-parts-builder';
import { getDeniedDistributionLists } from 'soap/errors/send-to-distribution-list-denied';
import { forwardAppointmentRequest } from 'soap/forward-appointment-request';

type UseForwardAppointmentParams = {
	eventId: string;
	subject: string;
	onSuccess: () => void;
	onError: (fault?: SoapFault) => void;
	onComplete: () => void;
};

type ForwardAppointmentHandler = (
	contacts: ContactInputItem[],
	messageParts: MessagePart[]
) => Promise<void>;

export const useForwardAppointment = ({
	eventId,
	subject,
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
					subject,
					messageParts
				});

				if (!response || 'Fault' in response) {
					const fault = response?.Fault;
					onError(fault);
					// keep the modal open so the user can remove the denied lists and retry
					if (getDeniedDistributionLists(fault)) {
						return;
					}
				} else {
					onSuccess();
				}
			} catch {
				onError();
			}
			onComplete();
		},
		[eventId, subject, onSuccess, onError, onComplete]
	);
