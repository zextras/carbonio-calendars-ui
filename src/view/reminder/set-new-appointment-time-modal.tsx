/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement } from 'react';

import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { SetNewTimeModalProps } from '../../types/appointment-reminder';

export const SetNewAppointmentTimeModal: FC<SetNewTimeModalProps> = ({
	toggleModal,
	setNewTime
}): ReactElement => {
	const [t] = useTranslation();
	const rescheduleLabel = t('label.reschedule_appointment', 'Reschedule appointment');
	const setNewTimeMessage = t(
		'reminder.modal.set_new_time_message',
		'Are you sure you want to reschedule the missed appointment? If you click OK, all the other reminders will be automatically dismissed.'
	);
	const goBackLabel = t('folder.modal.footer.go_back', 'Go back');
	const confirmLabel = t('label.ok', 'OK');

	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<ModalHeader title={rescheduleLabel} />
			<Padding vertical="extrasmall" />
			<Container padding={{ vertical: 'medium' }}>
				<Text overflow="break-word">{setNewTimeMessage}</Text>
			</Container>
			<ModalFooter
				onConfirm={setNewTime}
				secondaryAction={toggleModal}
				secondaryLabel={goBackLabel}
				label={confirmLabel}
			/>
		</Container>
	);
};
