/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react';

import { ChipInput, ChipItem, Container, Divider, Text } from '@zextras/carbonio-design-system';
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
	const disabled = false;

	const onConfirm = useCallback(() => {
		forwardAppointmentRequest({
			id: eventId,
			attendees: contacts.map((contact) => contact.email)
		});
	}, [contacts, eventId]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
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
