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

	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<ModalHeader title={t('label.set_new_time', 'Set new time')} />
			<Padding vertical="extrasmall" />
			<Container padding={{ vertical: 'medium' }}>
				<Text overflow="break-word">{t('reminder.modal.set_new_time_message')}</Text>
			</Container>
			<ModalFooter
				onConfirm={setNewTime}
				secondaryAction={toggleModal}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={t('label.ok', 'OK')}
			/>
		</Container>
	);
};
