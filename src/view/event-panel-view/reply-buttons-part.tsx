/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Button, Container, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { proposeNewTimeFn } from '../../actions/appointment-actions-fn';
import { useCalendarFolders } from '../../hooks/use-calendar-folders';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { useAppDispatch } from '../../store/redux/hooks';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';

type ReplyButtonProps = {
	event: EventType;
	invite: Invite;
};

export const ReplyButtonsPart = ({ event, invite }: ReplyButtonProps): ReactElement => {
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const folders = useCalendarFolders();

	const replyAction = useCallback(
		(action) => {
			dispatch(
				sendInviteResponse({
					inviteId: event?.resource?.inviteId,
					updateOrganizer: true,
					action
				})
			);
		},
		[dispatch, event?.resource?.inviteId]
	);

	const context = useMemo(
		() => ({
			dispatch,
			folders
		}),
		[dispatch, folders]
	);

	return (
		<Container
			orientation="horizontal"
			crossAlignment="flex-start"
			mainAlignment="center"
			width="fill"
			height="fit"
			padding={{ all: 'large' }}
			background={'gray6'}
		>
			<Button
				type="outlined"
				label={t('event.action.accept', 'Accept')}
				icon="CheckmarkOutline"
				color="success"
				onClick={(): void => replyAction('ACCEPT')}
				disabled={event.resource.participationStatus === 'AC'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('label.maybe', 'maybe')}
				icon="QuestionMarkOutline"
				color="warning"
				onClick={(): void => replyAction('TENTATIVE')}
				disabled={event.resource.participationStatus === 'TE'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('event.action.decline', 'Decline')}
				icon="CloseOutline"
				color="error"
				onClick={(): void => replyAction('DECLINE')}
				disabled={event.resource.participationStatus === 'DE'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('label.propose_new_time', 'Propose new time')}
				icon="ClockOutline"
				color="primary"
				onClick={proposeNewTimeFn({ event, invite, context })}
			/>
		</Container>
	);
};
