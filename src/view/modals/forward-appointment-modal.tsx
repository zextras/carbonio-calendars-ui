/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react';

import {
	ChipInput,
	ChipItem,
	Container,
	Divider,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { t, useIntegratedComponent } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { forwardAppointmentRequest } from '../../soap/forward-appointment-request';

type ForwardAppointmentModalProps = {
	eventId: string;
	onClose: () => void;
};

type ContactType = {
	company?: string;
	email: string;
	firstName?: string;
	fullName?: string;
	id?: string;
	label?: string;
	lastName?: string;
};

export const ForwardAppointmentModal = ({
	eventId,
	onClose
}: ForwardAppointmentModalProps): React.JSX.Element => {
	const [contacts, setContacts] = useState<ContactType[]>([]);
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const createSnackbar = useSnackbar();
	const modalHeaderTitle = t('modal.forwardAppointment.title', 'Forward appointment');
	const modalContent = t(
		'modal.forwardAppointment.content',
		'You are forwarding this appointment to another person who will receive an invitation to join the meeting.'
	);
	const onConfirmButtonLabel = t('modal.buttonLabel.forward', 'Forward');
	const inputPlaceholder = t('modal.forwardAppointment.placeholder', 'Add new attendees');
	const onChipInputChange = useCallback((items: ChipItem[]) => {
		setContacts(
			items.map<ContactType>(
				(item) =>
					({
						address: item.label,
						email: item.label
					}) as ContactType
			)
		);
	}, []);
	const onContactChange = useCallback((users: ContactType[]) => setContacts(users), []);
	const disabled = contacts.length === 0;
	const invokeErrorSnackbar = useCallback((): void => {
		createSnackbar({
			key: 'forward-appointment-error',
			replace: true,
			type: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}, [createSnackbar]);

	const onConfirm = useCallback(async () => {
		const response = await forwardAppointmentRequest({
			id: eventId,
			attendees: contacts.map((contact) => contact.email)
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
			type: 'info',
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
						{integrationAvailable ? (
							<ContactInput
								data-testid={'forward-appointment-contact-input'}
								placeholder={inputPlaceholder}
								onChange={onContactChange}
								defaultValue={contacts}
								disablePortal
							/>
						) : (
							<ChipInput
								data-testid={'forward-appointment-input'}
								placeholder={inputPlaceholder}
								onChange={onChipInputChange}
								defaultValue={contacts}
							/>
						)}
					</Container>
					<Divider color="primary" />
					<ModalFooter onConfirm={onConfirm} label={onConfirmButtonLabel} disabled={disabled} />
				</Container>
			</Container>
		</Container>
	);
};
