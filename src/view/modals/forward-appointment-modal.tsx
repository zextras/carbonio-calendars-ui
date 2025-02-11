/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react';

import { Container, Divider, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { useContactInput } from '../../carbonio-ui-commons/integrations/hooks';
import { ContactInputItem } from '../../carbonio-ui-commons/integrations/types';
import { forwardAppointmentRequest } from '../../soap/forward-appointment-request';

type ForwardAppointmentModalProps = {
	eventId: string;
	onClose: () => void;
};

export const ForwardAppointmentModal = ({
	eventId,
	onClose
}: ForwardAppointmentModalProps): React.JSX.Element => {
	const [contacts, setContacts] = useState<ContactInputItem[]>([]);
	const ContactInput = useContactInput();
	const createSnackbar = useSnackbar();
	const modalHeaderTitle = t('modal.forwardAppointment.title', 'Forward appointment');
	const modalContent = t(
		'modal.forwardAppointment.content',
		'You are forwarding this appointment to one or more attendees who will receive an invitation to join the meeting.'
	);
	const onConfirmButtonLabel = t('modal.buttonLabel.forward', 'Forward');
	const inputPlaceholder = t('modal.forwardAppointment.placeholder', 'Add new attendees');
	const onContactChange = useCallback((users: ContactInputItem[]) => setContacts(users), []);
	const disabled = contacts.length === 0;
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
			attendees: contacts.map((contact) => contact.value.email)
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
	}, [contacts, createSnackbar, eventId, invokeErrorSnackbar, onClose]);

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
