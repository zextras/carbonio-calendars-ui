/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ButtonOld as Button, Container, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { ParticipationStatus } from '../../types/store/invite';

type ReplyButtonProps = {
	inviteId: string;
	participationStatus: ParticipationStatus;
};

export const ReplyButtonsPart = ({
	inviteId,
	participationStatus
}: ReplyButtonProps): ReactElement => {
	const dispatch = useAppDispatch();

	const replyAction = useCallback(
		(action) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: true,
					action
				})
			);
		},
		[dispatch, inviteId]
	);

	return (
		<Container
			orientation="horizontal"
			crossAlignment="flex-start"
			mainAlignment="center"
			width="fill"
			height="fit"
			padding={{ all: 'large' }}
			background="gray6"
		>
			<Button
				type="outlined"
				label={t('event.action.yes', 'yes')}
				icon="CheckmarkCircle2"
				color="success"
				onClick={(): void => replyAction('ACCEPT')}
				disabled={participationStatus === 'AC'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('label.maybe', 'maybe')}
				icon="QuestionMarkCircle"
				color="warning"
				onClick={(): void => replyAction('TENTATIVE')}
				disabled={participationStatus === 'TE'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('event.action.no', 'no')}
				icon="CloseCircle"
				color="error"
				onClick={(): void => replyAction('DECLINE')}
				disabled={participationStatus === 'DE'}
			/>
		</Container>
	);
};
