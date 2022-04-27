/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable import/extensions */
import React, { FC, ReactElement, useMemo, useEffect, useCallback } from 'react';
import {
	Container,
	Padding,
	Row,
	Icon,
	Text,
	Avatar,
	Divider
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import moment from 'moment';
import 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import { times } from 'lodash';
import InviteReplyPart from './parts/invite-reply-part';
import ProposedTimeReply from './parts/proposed-time-reply';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { inviteToEvent } from '../../hooks/use-invite-to-event';
import { getInvite } from '../../store/actions/get-invite';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from '../../constants';
import BodyMessageRenderer from '../../commons/body-message-renderer.jsx';
import { useInvite } from '../../hooks/use-invite';

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
	const fullInvite = useInvite(mailMsg?.id);

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

	const requiredParticipants = useMemo(
		() =>
			invite[0]?.comp[0].at
				.filter((user: any) => user.role === 'REQ')
				.map((user: any, index: number) =>
					index === (invite[0]?.comp[0].at.length ?? 1) - 1 // the nullish coalescing is
						? `${user.d || user.a}`
						: `${user.d || user.a},`
				),
		[invite]
	);

	const requiredParticipantsAccepted = useMemo(
		() =>
		invite[0]?.comp[0].at.filter((user: any) => (user.rsvp == true && user.role === 'REQ')),
		[invite]
	);

	console.clear();
	console.log('qui');
	console.log(fullInvite);

	const optionalParticipants = useMemo(
		() =>
			invite[0]?.comp[0].at
				.filter((user: any) => user.role === 'OPT')
				.map((user: any, index: number) =>
					index === (invite[0]?.comp[0].at.length ?? 1) - 1 // the nullish coalescing is
						? `${user.d || user.a}`
						: `${user.d || user.a},`
				),
		[invite]
	);
	const proposeNewTime = useCallback(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(getInvite({ inviteId })).then((res) => {
			const normalizedInvite = { ...normalizeInvite(res.payload.m), ...res.payload.m };
			const requiredEvent = inviteToEvent(normalizeInvite(res.payload.m));
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			getBridgedFunctions().addBoard(
				`${CALENDAR_ROUTE}/edit?edit=${res?.payload?.m?.inv[0]?.comp[0]?.apptId}`,
				{
					app: CALENDAR_APP_ID,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					event: requiredEvent,
					invite: normalizedInvite,
					proposeNewTime: true
				}
			);
		});
	}, [dispatch, inviteId]);
	return (
		<InviteContainer padding={{ all: 'extralarge' }}>
			<Container padding={{ horizontal: 'small', vertical: 'large' }} width="100%">
				<Row width="fill" mainAlignment="flex-start" padding={{ bottom: 'extrasmall' }}>
					{method === 'COUNTER' ? (
						<Text weight="light" size="large">
							{mailMsg.subject}
						</Text>
					) : (
						<>
							<Text weight="regular" size="large">
								{invite[0]?.comp[0]?.or.d || invite[0]?.comp[0]?.or.a}{' '}
								{t('message.invited_you', 'invited you to ')}
							</Text>
							&nbsp;
							<Text weight="bold" size="large">
								{mailMsg.subject ? mailMsg.subject : invite[0]?.comp[0].name}
							</Text>
						</>
					)}
				</Row>
				<Row width="100%" mainAlignment="flex-start">
					<Row width="100%" mainAlignment="flex-start">
						<Text overflow="break-word">{apptTime}</Text>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'extrasmall' }}>
						<Text color="gray1" size="small" overflow="break-word">
							GMT {apptTimeZone}
						</Text>
					</Row>
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
								proposeNewTime={proposeNewTime}
							/>
					  )}
				<Row width="100%" mainAlignment="flex-start" padding={{ vertical: 'large' }}>
					<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
							<Icon size="large" icon="PeopleOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
							<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
								<Text overflow="break-word">
									{`${requiredParticipants.length} ${t('message.guests', 'guests')}`}
								</Text>
							</Row>
							<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'small' }}>
								<Text overflow="break-word" color="gray1" size="small">
									{`${requiredParticipantsAccepted.length} ${t('message.accepted', 'accepted')}, 5 ${t('message.awaiting', 'awaiting')}`}
								</Text>
							</Row>
							{requiredParticipants.map((value, index) => (
								<>
									<Row width="100%" padding={{ top: 'small' }}>
										<Avatar label={value} size="small" />
										<Row padding={{ left: 'small' }} takeAvailableSpace mainAlignment="flex-start">
											<Text overflow="break-word">{value}</Text>
										</Row>
									</Row>
								</>
							))}
						</Row>
					</Row>
					<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
							<Icon size="large" icon="OptionalInviteeOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
							<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
								<Text overflow="break-word">
									{`${optionalParticipants.length} ${t('message.optionals', 'optionals')}`}
								</Text>
							</Row>
							<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'small' }}>
								<Text overflow="break-word" color="gray1" size="small">
									{`1 ${t('message.accepted', 'accepted')}, 5 ${t('message.awaiting', 'awaiting')}`}
								</Text>
							</Row>
							{optionalParticipants.map((value, index) => (
								<>
									<Row width="100%" padding={{ top: 'small' }}>
										<Avatar label={value} size="small" />
										<Row padding={{ left: 'small' }} takeAvailableSpace mainAlignment="flex-start">
											<Text overflow="break-word">{value}</Text>
										</Row>
									</Row>
								</>
							))}
						</Row>
					</Row>
					<Row width="100%" padding={{ top: 'medium' }}>
						<Divider />
					</Row>
				</Row>
				<Row
					width="100%"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ bottom: 'large' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon size="large" icon="MessageSquareOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						{fullInvite && (
							<BodyMessageRenderer
								fullInvite={fullInvite}
								inviteId={inviteId}
								parts={fullInvite?.parts}
							/>
						)}
					</Row>
				</Row>
			</Container>
		</InviteContainer>
	);
};

export default InviteResponse;
