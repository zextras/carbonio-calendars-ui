/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/carbonio-design-system';
import { t, useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { map, reduce } from 'lodash';
import React, { useCallback } from 'react';
import { ModalHeader } from '../../commons/modal-header';
import ModalFooter from '../../commons/modal-footer';
import { Invite } from '../../types/store/invite';

type MessageModalProps = {
	title: string;
	onClose: () => void;
	onConfirm: (arg?: object) => void;
	invite: Invite;
	confirmLabel: string;
};

export const ModifyStandardMessageModal = ({
	title,
	onClose,
	onConfirm,
	confirmLabel,
	invite
}: MessageModalProps): React.ReactElement => {
	const [openComposer, available] = useIntegratedFunction('compose');

	const onEditMessage = useCallback(() => {
		onClose();
		if (available)
			openComposer(onConfirm, {
				text: [
					'text',
					`${t('message.meeting_canceled', 'The following meeting has been cancelled')}:`
				],
				subject: `${t('label.cancelled', 'Cancelled')} ${invite.name}`,
				to: reduce(
					invite?.participants ?? [],
					(acc, v) => {
						map(v, (contact: never) => acc.push(contact));
						return acc;
					},
					[]
				)
			});
	}, [onClose, available, openComposer, onConfirm, invite.name, invite?.participants]);

	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<ModalHeader title={title} onClose={onClose} />
			<Container
				padding={{ vertical: 'medium' }}
				mainAlignment="baseline"
				crossAlignment="baseline"
			>
				<Text overflow="break-word">
					{t(
						'message.want_to_edit_cancellation_msg',
						'Do you want to edit the appointment cancellation message?'
					)}
				</Text>
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				label={confirmLabel}
				secondaryColor="primary"
				secondaryBtnType="outlined"
				secondaryLabel={t('action.edit_message', 'Edit Message')}
				secondaryAction={onEditMessage}
				disabled={!invite}
			/>
		</Container>
	);
};
