/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { t, useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { map, reduce } from 'lodash';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { Invite } from '../../types/store/invite';

type MessageModalProps = {
	title: string;
	onClose: () => void;
	onConfirm: (arg?: { text: Array<string> }) => void;
	invite: Invite;
	confirmLabel: string;
	isEdited?: boolean;
};

export const ModifyStandardMessageModal = ({
	title,
	onClose,
	onConfirm,
	confirmLabel,
	invite,
	isEdited
}: MessageModalProps): React.ReactElement => {
	const [openComposer, available] = useIntegratedFunction('compose');

	const onEditMessage = useCallback(() => {
		onClose();
		const text = isEdited
			? t('message.meeting_modified', 'The following meeting has been modified')
			: t('message.meeting_canceled', 'The following meeting has been cancelled');
		const subject = isEdited ? invite.name : `${t('label.cancelled', 'Cancelled')} ${invite.name}`;
		if (available)
			openComposer(onConfirm, {
				text: [`${text}:`, `${text}:`],
				subject,
				to: reduce(
					invite?.participants ?? [],
					(acc, v) => {
						map(v, (contact: never) => acc.push(contact));
						return acc;
					},
					[]
				)
			});
	}, [onClose, isEdited, invite.name, invite?.participants, available, openComposer, onConfirm]);

	const bodyText = useMemo(
		() =>
			isEdited
				? t(
						'message.want_to_edit_modified_msg',
						"Do you want to edit the modified appointment's message?"
					)
				: t(
						'message.want_to_edit_cancellation_msg',
						'Do you want to edit the appointment cancellation message?'
					),
		[isEdited]
	);

	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<ModalHeader title={title} onClose={onClose} />
			<Container
				padding={{ vertical: 'medium' }}
				mainAlignment="baseline"
				crossAlignment="baseline"
			>
				<Text overflow="break-word">{bodyText}</Text>
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
