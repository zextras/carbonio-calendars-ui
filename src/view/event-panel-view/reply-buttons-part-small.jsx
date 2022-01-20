/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDispatch } from 'react-redux';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Padding, Row, Dropdown, Icon, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { updateParticipationStatus } from '../../store/slices/appointments-slice';

const AttendingRow = styled(Row)`
	border: 1px solid ${(props) => props.theme.palette.primary.regular};
`;

export default function ReplyButtonsPartSmall({ inviteId, participationStatus, compNum }) {
	const dispatch = useDispatch();
	const decline = useCallback(() => {
		dispatch(
			sendInviteResponse({
				inviteId,
				updateOrganizer: false,
				action: 'DECLINE',
				compNum
			})
		).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'DE' })));
	}, [dispatch, inviteId, compNum]);

	const tentative = useCallback(() => {
		dispatch(
			sendInviteResponse({
				inviteId,
				updateOrganizer: false,
				action: 'TENTATIVE',
				compNum
			})
		).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'TE' })));
	}, [dispatch, inviteId, compNum]);

	const accept = useCallback(() => {
		dispatch(
			sendInviteResponse({
				inviteId,
				updateOrganizer: false,
				action: 'ACCEPT',
				compNum
			})
		).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'AC' })));
	}, [dispatch, inviteId, compNum]);

	const attendeesOptions = [
		{
			id: 'option_1',
			icon: 'CloseOutline',
			label: 'NO',
			value: 'NO',
			action: decline
		},
		{
			id: 'option_2',
			icon: 'CheckmarkOutline',
			label: 'ACCEPTED',
			value: 'AC',
			action: accept
		},
		{
			id: 'option_3',
			icon: 'QuestionMarkOutline',
			label: 'TENTATIVE',
			value: 'TE',
			action: tentative
		}
	];

	const attendingResponse = (value) => {
		switch (value) {
			case 'TE':
				return {
					id: 'option_3',
					icon: 'QuestionMarkOutline',
					label: 'TENTATIVE',
					value: 'TE',
					action: tentative
				};
			case 'AC':
				return {
					id: 'option_2',
					icon: 'CheckmarkOutline',
					label: 'ACCEPTED',
					value: 'AC',
					action: accept
				};

			case 'DE':
				return {
					id: 'option_1',
					icon: 'CloseOutline',
					label: 'NO',
					value: 'DE',
					action: decline
				};
			default:
				return {
					id: 'option_1',
					icon: 'CloseOutline',
					label: 'NO',
					value: 'NE'
				};
		}
	};

	const [invtReply, setInvtReply] = useState(attendingResponse(participationStatus));

	return (
		<>
			<Dropdown
				items={map(attendeesOptions, (action) => ({
					id: action.label,
					icon: action.icon,
					label: action.label,
					key: action.id,
					click: (ev) => {
						ev.stopPropagation();
						action.action();
						setInvtReply(action);
					}
				}))}
				placement="bottom-end"
			>
				<AttendingRow padding={{ all: 'small' }}>
					<Padding right="small">
						<Icon color="primary" icon={invtReply.icon} />
					</Padding>
					<Padding right="small">
						<Text color="primary">{invtReply.label}</Text>
					</Padding>
					<Icon color="primary" icon="ArrowIosDownwardOutline" />
				</AttendingRow>
			</Dropdown>
		</>
	);
}
