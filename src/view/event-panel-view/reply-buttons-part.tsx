/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Button, Container, Padding } from '@zextras/carbonio-design-system';
import { useHistoryNavigation, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { acceptAsAction, proposeNewTimeFn } from '../../actions/appointment-actions-fn';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { useAppDispatch } from '../../store/redux/hooks';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { InviteReplyVerb } from 'soap/send-invite-reply-request';

type ReplyButtonProps = {
	event: EventType;
	invite: Invite;
};

export const ReplyButtonsPart = ({ event, invite }: ReplyButtonProps): ReactElement => {
	const [t] = useTranslation();
	const { replaceHistory } = useHistoryNavigation();
	const dispatch = useAppDispatch();
	const folders = useFoldersMap();
	const context = useMemo(
		() => ({
			dispatch,
			folders,
			t,
			replaceHistory,
			isInstance: !!event.resource.ridZ
		}),
		[dispatch, event.resource.ridZ, folders, replaceHistory, t]
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
				onClick={acceptAsAction({ actionType: InviteReplyVerb.ACCEPT, event, invite, context })}
				disabled={event.resource.participationStatus === PARTICIPATION_STATUS.ACCEPTED}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('label.tentative', 'Tentative')}
				icon="QuestionMarkOutline"
				color="warning"
				onClick={acceptAsAction({ actionType: InviteReplyVerb.TENTATIVE, event, invite, context })}
				disabled={event.resource.participationStatus === PARTICIPATION_STATUS.TENTATIVE}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label={t('event.action.decline', 'Decline')}
				icon="CloseOutline"
				color="error"
				onClick={acceptAsAction({ actionType: InviteReplyVerb.DECLINE, event, invite, context })}
				disabled={event.resource.participationStatus === PARTICIPATION_STATUS.DECLINED}
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
