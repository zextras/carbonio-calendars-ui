/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState, useMemo, useEffect } from 'react';

import { Container, Divider, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	ModalHeader,
	ModalFooter,
	useContactInput,
	ContactInputItem
} from '@zextras/carbonio-ui-commons';

import { forwardAppointmentRequest } from '../../soap/forward-appointment-request';
import { getMessageRequest } from '../../soap/get-message-request';
import { EventType } from 'types/event';

type ForwardAppointmentModalProps = {
	event: EventType;
	onClose: () => void;
};

export const ForwardAppointmentModal = ({
	event,
	onClose
}: ForwardAppointmentModalProps): React.JSX.Element => {
	const [contacts, setContacts] = useState<ContactInputItem[]>([]);
	const [messageData, setMessageData] = useState<any>(null);
	const ContactInput = useContactInput();
	const createSnackbar = useSnackbar();

	const eventId = event.resource.id;

	useEffect(() => {
		const fetchMessageData = async (): Promise<void> => {
			const eventRidZ = event.resource.ridZ;
			const eventInviteId = event.resource.inviteId;
			if (!eventInviteId) return;

			try {
				const response = await getMessageRequest({
					inviteId: eventInviteId,
					ridZ: eventRidZ
				});

				if (response && !('error' in response) && response.m) {
					setMessageData(response.m[0]);
				}
			} catch (error) {
				console.error('Failed to fetch message data:', error);
			}
		};

		fetchMessageData();
	}, [event.resource.id, event.resource.inviteId, event.resource.ridZ]);

	const modalHeaderTitle = t('modal.forwardAppointment.title', 'Forward appointment');
	const modalContent = t(
		'modal.forwardAppointment.content',
		'You are forwarding this appointment to one or more attendees who will receive an invitation to join the meeting.'
	);
	const onConfirmButtonLabel = t('modal.buttonLabel.forward', 'Forward');
	const inputPlaceholder = t('modal.forwardAppointment.placeholder', 'Add new attendees');
	const onContactChange = useCallback((users: ContactInputItem[]) => setContacts(users), []);
	const disabled = contacts.length === 0;

	// Build message parts with appointment content from fetched message data
	const messageParts = useMemo(() => {
		const invite = messageData?.inv?.[0]?.comp?.[0];
		const plainText = invite?.desc?.[0]?._content ?? '';
		const htmlContent = invite?.descHtml?.[0]?._content ?? '';

		const parts: Array<{ ct: string; content: string }> = [];

		// Add plain text part
		if (plainText) {
			parts.push({
				ct: 'text/plain',
				content: plainText
			});
		}

		// Add HTML part
		if (htmlContent) {
			parts.push({
				ct: 'text/html',
				content: htmlContent
			});
		}

		return parts;
	}, [messageData]);

	const invokeErrorSnackbar = useCallback((): void => {
		createSnackbar({
			key: 'forward-appointment-error',
			replace: true,
			severity: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}, [createSnackbar]);

	const onConfirm = useCallback(async () => {
		const response = await forwardAppointmentRequest({
			id: eventId,
			attendees: contacts.map((contact) => contact.value.email),
			messageParts
		})
			.catch(() => {
				invokeErrorSnackbar();
			})
			.finally(() => {
				onClose();
			});
		if (!response || 'Fault' in response) {
			invokeErrorSnackbar();
			return;
		}
		createSnackbar({
			key: 'forward-appointment-success',
			replace: true,
			severity: 'info',
			hideButton: false,
			label: t('snackbar.forwardAppointment.success', 'Appointment forwarded'),
			autoHideTimeout: 3000
		});
	}, [contacts, createSnackbar, eventId, invokeErrorSnackbar, onClose, messageParts]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			data-testid="forward-appointment-modal"
		>
			<ModalHeader onClose={onClose} title={modalHeaderTitle} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Container>
					<Text overflow="break-word">{modalContent}</Text>
					<Container height="fit" padding={{ top: 'medium' }}>
						<ContactInput
							data-testid={'forward-appointment-input'}
							placeholder={inputPlaceholder}
							onChange={onContactChange}
							defaultValue={contacts}
						/>
					</Container>
					<Divider color="primary" />
					<ModalFooter onConfirm={onConfirm} label={onConfirmButtonLabel} disabled={disabled} />
				</Container>
			</Container>
		</Container>
	);
};
