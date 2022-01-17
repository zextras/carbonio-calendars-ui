/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable import/extensions */
import React, { FC, ReactElement, useMemo, useEffect, useCallback } from 'react';
import { Container, Padding, Row, Icon, Text, Button } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import moment from 'moment';
import 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { useAddBoardCallback } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import InviteReplyPart from './parts/invite-reply-part';
import ProposedTimeReply from './parts/proposed-time-reply';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { inviteToEvent } from '../../hooks/use-invite-to-event';
import { getInvite } from '../../store/actions/get-invite';
import { CALENDAR_APP_ID } from '../../constants';

const InviteContainer = styled(Container)`
	border: 1px solid ${({ theme }: any): string => theme.palette.gray2.regular};
	border-radius: 14px;
	margin: ${({ theme }: any): string => theme.sizes.padding.extrasmall};
`;
type InviteResponse = {
	inviteId: string;
	invite: any;
	participationStatus: string;
	compNum: string;
	method: string;
	moveToTrash: () => void;
	mailMsg: any;
	onLoadChange: () => void;
	to: { address: string; fullName: string; name: string; type: string };
	parent: string;
	isAttendee: boolean;
};

const InviteResponse: FC<InviteResponse> = ({
	inviteId,
	participationStatus,
	invite,
	compNum,
	method,
	moveToTrash,
	mailMsg,
	onLoadChange,
	to,
	parent,
	isAttendee
}): ReactElement => {
	const dispatch = useDispatch();
	const [t] = useTranslation();
	useEffect(() => {
		if (!mailMsg.read) {
			onLoadChange();
		}
	}, [mailMsg.read, onLoadChange]);
	const apptTime = useMemo(
		() =>
			moment(invite[0]?.comp[0].s[0].u).format(
				`dddd, DD MMM, YYYY [${moment(invite[0]?.comp[0].s[0].u).format(`HH:mm`)}]-[${moment(
					invite[0]?.comp[0].e[0].u
				).format(`HH:mm`)}]`
			),
		[invite]
	);

	const apptTimeZone = useMemo(
		() =>
			`${moment(invite[0]?.comp[0].s[0].u).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`,
		[invite]
	);

	const participants = useMemo(
		() =>
			invite[0]?.comp[0].at.map((user: any, index: number) =>
				index === (invite[0]?.comp[0].at.length ?? 1) - 1 // the nullish coalescing is
					? `${user.a || user.d}`
					: `${user.a || user.d},`
			),
		[invite]
	);
	const addBoard = useAddBoardCallback();
	const proposeNewTime = useCallback(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(getInvite({ inviteId })).then((res) => {
			const normalizedInvite = { ...normalizeInvite(res.payload.m), ...res.payload.m };
			const requiredEvent = inviteToEvent(normalizeInvite(res.payload.m));
			addBoard(`/edit?edit=${res.payload.m.inv[0].comp[0].apptId}`, {
				app: CALENDAR_APP_ID,
				event: requiredEvent,
				invite: normalizedInvite,
				proposeNewTime: true
			});
		});
	}, [dispatch, addBoard, inviteId]);
	return (
		<InviteContainer padding={{ all: 'extralarge' }}>
			<Container padding={{ horizontal: 'small', vertical: 'large' }} width="100%">
				<Row padding={{ bottom: 'medium' }}>
					<Icon icon="CalendarOutline" size="large" />
					<Padding all="extrasmall" />
					{method === 'COUNTER' ? (
						<Text weight="bold" size="large">
							{mailMsg.subject}
						</Text>
					) : (
						<Text weight="bold" size="large">
							{invite[0]?.comp[0]?.or.d || invite[0]?.comp[0]?.or.a}{' '}
							{t('message.invited_you', 'invited you to an event')}
						</Text>
					)}
				</Row>
				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', bottom: 'small' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon icon="CalendarOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start" display="flex">
						<Text overflow="break-word">{invite[0]?.comp[0].name}</Text>
					</Row>
				</Row>
				<Row width="fill" mainAlignment="flex-start">
					<Row
						width="70%"
						mainAlignment="flex-start"
						padding={{ horizontal: 'small', bottom: 'small' }}
					>
						<Row padding={{ right: 'small' }}>
							<Icon icon="ClockOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start" display="flex">
							<Text overflow="break-word">
								{apptTime} GMT {apptTimeZone}
							</Text>
						</Row>
					</Row>
					{method !== 'COUNTER' && isAttendee && (
						<Row
							width="30%"
							mainAlignment="flex-start"
							padding={{ horizontal: 'small', bottom: 'small' }}
						>
							<Button
								type="ghost"
								label="PROPOSE NEW TIME"
								icon="RefreshOutline"
								color="primary"
								onClick={proposeNewTime}
							/>
						</Row>
					)}
				</Row>

				{invite[0]?.comp[0].loc && (
					<Row
						width="fill"
						mainAlignment="flex-start"
						padding={{ horizontal: 'small', bottom: 'small' }}
					>
						<Row padding={{ right: 'small' }}>
							<Icon icon="PinOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text overflow="break-word">{invite[0]?.comp[0].loc}</Text>
						</Row>
					</Row>
				)}
				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', bottom: 'small' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon icon="PeopleOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text overflow="break-word">{participants}</Text>
					</Row>
				</Row>

				<Row
					width="fill"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', bottom: 'large' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon icon="MessageSquareOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text overflow="break-word">
							{invite?.[0]?.comp?.[0]?.fr && invite?.[0]?.comp?.[0]?.fr !== 'undefined'
								? invite[0].comp[0].fr
								: invite[0]?.comp?.[0]?.desc?.[0]?._content}
						</Text>
					</Row>
				</Row>
				{method === 'COUNTER'
					? parent !== '5' && (
							// eslint-disable-next-line react/jsx-indent
							<ProposedTimeReply
								invite={invite}
								id={invite[0]?.comp?.[0]?.apptId}
								inviteId={inviteId}
								moveToTrash={moveToTrash}
								title={mailMsg.subject}
								to={to}
								fragment={invite[0]?.comp?.[0]?.fr}
							/>
					  )
					: isAttendee && (
							// eslint-disable-next-line react/jsx-indent
							<InviteReplyPart
								inviteId={inviteId}
								participationStatus={participationStatus}
								invite={invite}
								compNum={compNum}
							/>
					  )}
			</Container>
		</InviteContainer>
	);
};

export default InviteResponse;
