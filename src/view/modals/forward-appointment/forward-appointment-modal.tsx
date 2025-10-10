/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState, useMemo } from 'react';

import { Container, Divider, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	ModalHeader,
	ModalFooter,
	useContactInput,
	ContactInputItem
} from '@zextras/carbonio-ui-commons';

import { buildMessageParts } from './message-parts-builder';
import { useAppointmentMessageData } from './use-appointment-message-data';
import { useForwardAppointment } from './use-forward-appointment';
import { useForwardAppointmentSnackbar } from './use-forward-appointment-snackbar';
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
	const ContactInput = useContactInput();

	const messageData = useAppointmentMessageData({
		inviteId: event.resource.inviteId,
		ridZ: event.resource.ridZ
	});

	const messageParts = useMemo(() => buildMessageParts(messageData), [messageData]);

	const { showErrorSnackbar, showSuccessSnackbar } = useForwardAppointmentSnackbar();

	const forwardAppointment = useForwardAppointment({
		eventId: event.resource.id,
		onSuccess: showSuccessSnackbar,
		onError: showErrorSnackbar,
		onComplete: onClose
	});

	const onContactChange = useCallback((users: ContactInputItem[]) => setContacts(users), []);
	const disabled = contacts.length === 0;

	const onConfirm = useCallback(async () => {
		await forwardAppointment(contacts, messageParts);
	}, [contacts, messageParts, forwardAppointment]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			data-testid="forward-appointment-modal"
		>
			<ModalHeader
				onClose={onClose}
				title={t('modal.forwardAppointment.title', 'Forward appointment')}
			/>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Container>
					<Text overflow="break-word">
						{t(
							'modal.forwardAppointment.content',
							'You are forwarding this appointment to one or more attendees who will receive an invitation to join the meeting.'
						)}
					</Text>
					<Container height="fit" padding={{ top: 'medium' }}>
						<ContactInput
							data-testid={'forward-appointment-input'}
							placeholder={t('modal.forwardAppointment.placeholder', 'Add new attendees')}
							onChange={onContactChange}
							defaultValue={contacts}
						/>
					</Container>
					<Divider color="primary" />
					<ModalFooter
						onConfirm={onConfirm}
						label={t('modal.buttonLabel.forward', 'Forward')}
						disabled={disabled}
					/>
				</Container>
			</Container>
		</Container>
	);
};
