/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Icon,
	Text,
	Divider,
	Tooltip,
	Chip,
	Padding
} from '@zextras/carbonio-design-system';
import { getAction, Action, useUserAccount, FOLDERS, ROOT_NAME } from '@zextras/carbonio-shell-ui';
import { filter, find, includes, map } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import 'moment-timezone';
import { AvailabilityChecker } from './parts/availability-checker';
import InviteReplyPart from './parts/invite-reply-part';
import ProposedTimeReply from './parts/proposed-time-reply';
import { getRootAccountId, useRoot } from '../../carbonio-ui-commons/store/zustand/folder';
import BodyMessageRenderer, { extractBody } from '../../commons/body-message-renderer';
import { CALENDAR_RESOURCES } from '../../constants';
import { MESSAGE_METHOD, PARTICIPANT_ROLE } from '../../constants/api';
import { CRB_XPROPS, CRB_XPARAMS } from '../../constants/xprops';
import { useGetEventTimezoneString } from '../../hooks/use-get-event-timezone';
import { getLocalTime } from '../../normalizations/normalize-editor';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { StoreProvider } from '../../store/redux';
import type { InviteResponseArguments } from '../../types/integrations';

export function mailToContact(contact: object): Action | undefined {
	const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
	return available ? mailTo : undefined;
}

const InviteContainer = styled(Container)`
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	border-radius: 0.875rem;
	margin: ${({ theme }): string => theme.sizes.padding.extrasmall};
	padding: ${({ theme }): string => theme.sizes.padding.extralarge};
`;

const LinkText = styled(Text)`
	cursor: pointer;
	text-decoration: underline;
	&:hover {
		text-decoration: none;
	}
`;

export const InviteResponse: FC<InviteResponseArguments> = ({
	mailMsg,
	moveToTrash
}): ReactElement => {
	const account = useUserAccount();
	const invite = normalizeInvite({ ...mailMsg, inv: mailMsg.invite });
	const [t] = useTranslation();

	const rootAccountId = getRootAccountId(mailMsg.parent) ?? FOLDERS.USER_ROOT;
	const root = useRoot(rootAccountId);
	const email = useMemo(
		() => (root?.name === ROOT_NAME ? account.name : root?.name ?? account.name),
		[account.name, root?.name]
	);
	const isAttendee = useMemo(
		() => invite?.organizer?.a !== account.name,
		[account.name, invite?.organizer?.a]
	);

	const to = useMemo(
		() =>
			filter(
				mailMsg.participants as [{ address: string; fullName: string; name: string; type: string }],
				{ type: 'f' }
			),
		[mailMsg?.participants]
	);

	const method = mailMsg.invite[0]?.comp[0].method;

	const room = useMemo(() => find(invite.xprop, ['name', CRB_XPROPS.MEETING_ROOM]), [invite]);
	const roomName = find(room?.xparam, ['name', CRB_XPARAMS.ROOM_NAME])?.value;
	const roomLink = find(room?.xparam, ['name', CRB_XPARAMS.ROOM_LINK])?.value;

	const meetingRooms = useMemo(
		() => filter(invite.attendees, ['cutype', CALENDAR_RESOURCES.ROOM]),
		[invite.attendees]
	);

	const equipments = useMemo(
		() => filter(invite.attendees, ['cutype', CALENDAR_RESOURCES.RESOURCE]),
		[invite.attendees]
	);

	const equipmentsString = useMemo(
		() => map(equipments, (equipment) => equipment.d).join(', '),
		[equipments]
	);

	const rooms = useMemo(
		() => map(meetingRooms, (meetingRoom) => meetingRoom.d).join(', '),
		[meetingRooms]
	);

	const [maxReqParticipantsToShow, setMaxReqParticipantsToShow] = useState(2);
	const requiredParticipants = useMemo(
		() => invite.attendees.filter((user) => user.role === PARTICIPANT_ROLE.REQUIRED),
		[invite]
	);

	const [maxOptParticipantsToShow, setMaxOptParticipantsToShow] = useState(5);
	const optionalParticipants = useMemo(
		() => invite.attendees.filter((user) => user.role === PARTICIPANT_ROLE.OPTIONAL),
		[invite]
	);

	const replyMsg = (user: { a?: string; d?: string }): void => {
		const obj = {
			email: {
				email: {
					mail: user.a
				}
			},
			firstName: user.d ?? user.a,
			middleName: ''
		};

		mailToContact(obj)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			?.onClick?.();
	};

	const localTimezone = useMemo(() => moment.tz.guess(), []);

	/* start and end value are already converted to the creation timezone value, so to convert it back to the local timezone we need to convert it again to local */
	const localStart = useMemo(
		() =>
			getLocalTime(
				moment(invite.start?.d ?? invite.start.u).valueOf() ?? 0,
				localTimezone,
				invite.tz
			),
		[invite.start?.d, invite.start.u, invite.tz, localTimezone]
	);
	const localEnd = useMemo(
		() =>
			getLocalTime(moment(invite.end?.d ?? invite.end.u).valueOf() ?? 0, localTimezone, invite.tz),
		[invite.end?.d, invite.end.u, invite.tz, localTimezone]
	);

	const { localTimeString, localTimezoneString, showTimezoneTooltip, localTimezoneTooltip } =
		useGetEventTimezoneString(localStart, localEnd, invite.allDay, invite.tz);

	const messageHasABody = useMemo(() => {
		const body = extractBody(invite?.textDescription?.[0]?._content);
		/* TODO: appointments descriptions needs a refactor. Currently appointments descriptions are created with a double
		    quotes inside breaking the first condition */
		return body?.length > 0 && body !== '"';
	}, [invite?.textDescription]);

	const inviteId =
		invite.apptId && !includes(invite.id, ':') ? `${invite.apptId}-${invite.id}` : invite.id;

	const requiredSlice = requiredParticipants.slice(0, maxReqParticipantsToShow);
	return (
		<InviteContainer data-testid={'invite-response'}>
			<Container padding={{ horizontal: 'small', vertical: 'large' }} width="100%">
				<Row width="fill" mainAlignment="flex-start" padding={{ bottom: 'extrasmall' }}>
					{method === 'COUNTER' ? (
						<Text weight="light" size="large">
							{mailMsg.subject}
						</Text>
					) : (
						<>
							<Text weight="regular" size="large" style={{ fontSize: '1.125rem' }}>
								{`${invite.organizer?.d ?? invite.organizer?.a} ${t(
									'message.invited_you',
									'invited you to an event'
								)}`}
							</Text>
							&nbsp;
							<Text weight="bold" size="large" style={{ fontSize: '1.125rem' }}>
								{mailMsg.subject ? mailMsg.subject : invite?.name}
							</Text>
						</>
					)}
				</Row>
				<Row width="100%" mainAlignment="flex-start">
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{localTimeString}
					</Text>
					{showTimezoneTooltip && (
						<Tooltip label={localTimezoneTooltip}>
							<Padding left="small">
								<Icon icon="GlobeOutline" color="gray1" />
							</Padding>
						</Tooltip>
					)}
				</Row>
				<Row width="100%" mainAlignment="flex-start">
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{localTimezoneString}
					</Text>{' '}
				</Row>
				{method === MESSAGE_METHOD.REQUEST && root && (
					<AvailabilityChecker
						email={email}
						rootId={root.id}
						start={invite?.start?.u ?? moment(mailMsg.invite[0].comp[0].s[0].d).valueOf()}
						end={invite?.end?.u ?? moment(mailMsg.invite[0].comp[0].e[0].d).valueOf()}
						allDay={invite.allDay ?? false}
						uid={invite.uid}
					/>
				)}
				{method === 'COUNTER'
					? mailMsg.parent !== '5' && (
							// eslint-disable-next-line react/jsx-indent
							<ProposedTimeReply
								id={invite?.apptId}
								start={invite?.start?.u ?? moment(mailMsg.invite[0].comp[0].s[0].d).valueOf()}
								end={invite?.end?.u ?? moment(mailMsg.invite[0].comp[0].e[0].d).valueOf()}
								moveToTrash={moveToTrash}
								title={mailMsg.subject}
								to={to}
								msg={mailMsg}
								fragment={invite?.fragment}
							/>
						)
					: isAttendee && <InviteReplyPart inviteId={inviteId} message={mailMsg} />}

				{invite?.location && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Tooltip placement="left" label={t('tooltip.location', 'Location')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="PinOutline" />
							</Row>
						</Tooltip>

						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={invite?.organizer?.a}>
								<Text size="medium" overflow="break-word">
									{invite?.location}
								</Text>
							</Tooltip>
						</Row>
					</Row>
				)}

				{roomName && roomLink && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Tooltip placement="top" label={t('tooltip.virtual_room', 'Virtual room')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="VideoOutline" />
							</Row>
						</Tooltip>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={roomLink}>
								<LinkText color="gray1" size="medium" overflow="break-word">
									<a href={roomLink} target="_blank" rel="noreferrer">
										{roomName}
									</a>
								</LinkText>
							</Tooltip>
						</Row>
					</Row>
				)}

				{meetingRooms && meetingRooms?.length > 0 && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'small' }}>
						<Tooltip placement="left" label={t('tooltip.meetingRooms', 'MeetingRooms')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="BuildingOutline" />
							</Row>
						</Tooltip>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={t('tooltip.meetingRooms', 'MeetingRooms')}>
								<Text size="medium" overflow="break-word">
									{rooms}
								</Text>
							</Tooltip>
						</Row>
					</Row>
				)}

				{equipments && equipments.length > 0 && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'small' }}>
						<Tooltip placement="left" label={t('tooltip.equipment', 'Equipment')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="BriefcaseOutline" />
							</Row>
						</Tooltip>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={t('tooltip.equipment', 'Equipment')}>
								<Text size="medium" overflow="break-word">
									{equipmentsString}
								</Text>
							</Tooltip>
						</Row>
					</Row>
				)}

				<Row
					width="100%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ vertical: 'medium' }}
				>
					<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
							<Icon size="large" icon="PeopleOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
							<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
								<Text overflow="break-word">
									{t('message.required_participant', {
										count: requiredParticipants.length,
										defaultValue_one: '{{count}} Participant',
										defaultValue_other: '{{count}} Participants'
									})}
								</Text>
							</Row>

							<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
								{invite?.organizer?.d ? (
									<Tooltip placement="top" label={invite?.organizer?.a} maxWidth="100%">
										<div>
											<Chip
												avatarLabel={invite?.organizer?.d}
												label={
													<>
														<Text size="small">{invite?.organizer?.d}</Text>&nbsp;
														<Text size="small" color="secondary">
															({t('message.organizer')})
														</Text>
													</>
												}
												background={'gray3'}
												color="secondary"
												actions={[
													{
														id: 'action1',
														label: t('message.send_email'),
														type: 'button',
														icon: 'EmailOutline',
														onClick: () => replyMsg(invite?.organizer)
													}
												]}
											/>
										</div>
									</Tooltip>
								) : (
									<Chip
										avatarLabel={invite?.organizer?.a}
										label={
											<>
												<Text>{invite?.organizer?.a}</Text>&nbsp;
												<Text color="secondary">({t('message.organizer')})</Text>
											</>
										}
										background={'gray3'}
										color="text"
										actions={[
											{
												id: 'action1',
												label: t('message.send_email'),
												type: 'button',
												icon: 'EmailOutline',
												onClick: () => replyMsg(invite?.organizer)
											}
										]}
									/>
								)}
							</Row>
							{requiredSlice.map((p, index: number) => (
								<Row
									mainAlignment="flex-start"
									width="100%"
									padding={{ top: 'small' }}
									key={`${p.d ?? p.a}-${index}-1`}
								>
									{
										<Tooltip placement="top" label={p.a ?? p.d ?? ''} maxWidth="100%">
											<div>
												<Chip label={p.d ?? p.a} />
											</div>
										</Tooltip>
									}
								</Row>
							))}
							{maxReqParticipantsToShow < requiredParticipants.length && (
								<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
									<LinkText
										color="primary"
										size="medium"
										onClick={(): void => setMaxReqParticipantsToShow(requiredParticipants.length)}
										overflow="break-word"
									>
										{t('message.more', 'More...')}
									</LinkText>
								</Row>
							)}
						</Row>
					</Row>

					{optionalParticipants.length > 0 && (
						<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="OptionalInviteeOutline" />
							</Row>
							<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
								<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
									<Text overflow="break-word">
										{t('message.optional_participant', {
											count: optionalParticipants.length,
											defaultValue_one: '{{count}} Optional',
											defaultValue_other: '{{count}} Optionals'
										})}
									</Text>
								</Row>
								{optionalParticipants.slice(0, maxOptParticipantsToShow).map((p, index: number) => (
									<Row
										mainAlignment="flex-start"
										width="100%"
										padding={{ top: 'small' }}
										key={`${p.d ?? p.a}-${index}-2`}
									>
										{
											<Tooltip placement="top" label={p.d ?? p.a} maxWidth="100%">
												<div>
													<Chip label={p.d ?? p.a} />
												</div>
											</Tooltip>
										}
									</Row>
								))}
								{maxOptParticipantsToShow < optionalParticipants.length && (
									<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
										<LinkText
											color="primary"
											size="medium"
											// eslint-disable-next-line max-len
											onClick={(): void => setMaxOptParticipantsToShow(optionalParticipants.length)}
											overflow="break-word"
										>
											{t('message.more', 'More...')}
										</LinkText>
									</Row>
								)}
							</Row>
						</Row>
					)}
				</Row>
				{invite && messageHasABody && (
					<Row
						width="100%"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ bottom: 'large' }}
					>
						<Row width="100%" padding={{ vertical: 'medium' }}>
							<Divider />
						</Row>
						<Row padding={{ right: 'small' }}>
							<Icon size="large" icon="MessageSquareOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<BodyMessageRenderer fullInvite={invite} inviteId={inviteId} parts={invite?.parts} />
						</Row>
					</Row>
				)}
			</Container>
		</InviteContainer>
	);
};

const InviteResponseComp: FC<InviteResponseArguments> = (props) => (
	<StoreProvider>
		<InviteResponse {...props} />
	</StoreProvider>
);
export default InviteResponseComp;
