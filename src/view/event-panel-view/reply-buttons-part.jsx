/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDispatch } from 'react-redux';
import React, { useCallback } from 'react';
import { Button, Container, Padding } from '@zextras/zapp-ui';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { updateParticipationStatus } from '../../store/slices/appointments-slice';

export default function ReplyButtonsPart({ inviteId, participationStatus, compNum }) {
	const dispatch = useDispatch();
	const decline = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'DECLINE',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'DE' })));
		},
		[dispatch, inviteId, compNum]
	);
	const tentative = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'TENTATIVE',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'TE' })));
		},
		[dispatch, inviteId, compNum]
	);
	const accept = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'ACCEPT',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'AC' })));
		},
		[dispatch, inviteId, compNum]
	);

	return (
		<Container
			orientation="horizontal"
			crossAlignment="flex-start"
			mainAlignment="center"
			weight="fill"
			height="fit"
			padding={{ all: 'large' }}
			background="gray6"
		>
			<Button
				type="outlined"
				label="YES"
				icon="CheckmarkCircle2"
				color="success"
				onClick={accept}
				disabled={participationStatus === 'AC'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label="MAYBE"
				icon="QuestionMarkCircle"
				color="warning"
				onClick={tentative}
				disabled={participationStatus === 'TE'}
			/>
			<Padding horizontal="small" />
			<Button
				type="outlined"
				label="NO"
				icon="CloseCircle"
				color="error"
				onClick={decline}
				disabled={participationStatus === 'DE'}
			/>
		</Container>
	);
}
