/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/extensions */
import React, { FC, ReactElement } from 'react';
import { Container, Text, Padding } from '@zextras/carbonio-design-system';
import ModalFooter from '../../commons/modal-footer';
// @ts-ignore
import { ModalHeader } from '../../commons/modal-header';
import { SetNewTimeModalProps } from '../../types/appointment-reminder';

const SetNewTimeModal: FC<SetNewTimeModalProps> = ({
	toggleModal,
	t,
	setNewTime
}): ReactElement => (
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

export default SetNewTimeModal;
