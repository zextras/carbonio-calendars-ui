/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo, useEffect, useCallback, useState } from 'react';

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
import { addBoard, getAction, Action, t, Board, useUserAccount } from '@zextras/carbonio-shell-ui';
import { filter, find, includes, map } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';

import 'moment-timezone';

import InviteReplyPart from './parts/invite-reply-part';
import ProposedTimeReply from './parts/proposed-time-reply';
import BodyMessageRenderer, { extractBody } from '../../commons/body-message-renderer';
import { generateEditor } from '../../commons/editor-generator';
import { CALENDAR_RESOURCES, CALENDAR_ROUTE } from '../../constants';
import { PARTICIPANT_ROLE } from '../../constants/api';
import { CRB_XPROPS, CRB_XPARAMS } from '../../constants/xprops';
import { useCalendarFolders } from '../../hooks/use-calendar-folders';
import { useGetEventTimezoneString } from '../../hooks/use-get-event-timezone';
import { inviteToEvent } from '../../hooks/use-invite-to-event';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { getInvite } from '../../store/actions/get-invite';
import { StoreProvider } from '../../store/redux';
import { useAppDispatch } from '../../store/redux/hooks';

/**
   @todo: haveEquipment - momentary variables to dynamize
* */
const haveEquipment = false;

export function mailToContact(contact: object): Action | undefined {
	const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
	return available ? mailTo : undefined;
}

const InviteContainer = styled(Container)`
	border: 0.0625rem solid ${({ theme }: any): string => theme.palette.gray2.regular};
	border-radius: 0.875rem;
	margin: ${({ theme }: any): string => theme.sizes.padding.extrasmall};
`;

const LinkText = styled(Text)`
	cursor: pointer;
	text-decoration: underline;
	&:hover {
		text-decoration: none;
	}
`;

type InviteResponse = {
	mailMsg: any & {
		participants: { address: string; fullName: string; name: string; type: string };
	};
	moveToTrash?: () => void;
	onLoadChange?: () => void;
};

const InviteResponse: FC<InviteResponse> = ({
	mailMsg,
	moveToTrash,
	onLoadChange
}): ReactElement => {
	const dispatch = useAppDispatch();
	const calendarFolders = useCalendarFolders();
	const account = useUserAccount();
	const invite = normalizeInvite({ ...mailMsg, inv: mailMsg.invite });

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

	const { parent } = mailMsg;

	const inviteId =
		invite.apptId && !includes(invite.id, ':') ? `${invite.apptId}-${invite.id}` : invite.id;

	const participationStatus = mailMsg?.invite?.[0]?.replies?.[0].reply?.[0]?.ptst ?? '';

	useEffect(() => {
		if (!mailMsg.read && onLoadChange) {
			onLoadChange();
		}
	}, [mailMsg.read, onLoadChange]);

	const apptTime = useMemo(() => {
		if (invite.allDay) {
			return moment(invite.start.d).format(`dddd, DD MMM, YYYY`);
		}
		return moment(invite.start.u).format(
			`dddd, DD MMM, YYYY [${moment(invite.start.u).format(`HH:mm`)}]-[${moment(
				invite.end.u
			).format(`HH:mm`)}]`
		);
	}, [invite]);

	const room = useMemo(() => find(invite.xprop, ['name', CRB_XPROPS.MEETING_ROOM]), [invite]);
	const roomName = find(room?.xparam, ['name', CRB_XPARAMS.ROOM_NAME])?.value;
	const roomLink = find(room?.xparam, ['name', CRB_XPARAMS.ROOM_LINK])?.value;

	const meetingRooms = useMemo(
		() => filter(invite.attendees, ['cutype', CALENDAR_RESOURCES.ROOM]),
		[invite.attendees]
	);

	const rooms = useMemo(
		() => map(meetingRooms, (meetingRoom) => meetingRoom.d).join(', '),
		[meetingRooms]
	);

	const apptTimeZone = useMemo(
		() => `${moment(invite.start.u).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`,
		[invite]
	);

	const [maxReqParticipantsToShow, setMaxReqParticipantsToShow] = useState(4);
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
			firstName: user.d ?? user.d ?? user.a,
			middleName: ''
		};

		mailToContact(obj)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			?.onClick?.();
	};

	const proposeNewTimeCb = useCallback(() => {
		dispatch(getInvite({ inviteId })).then(({ payload }) => {
			if (payload) {
				const normalizedInvite = normalizeInvite(payload.m?.[0]);
				const requiredEvent = inviteToEvent(normalizedInvite);
				const editor = generateEditor({
					event: requiredEvent,
					invite: normalizedInvite,
					context: {
						dispatch,
						folders: calendarFolders,
						isProposeNewTime: true,
						attendees: [
							{
								email: requiredEvent.resource.organizer.a ?? requiredEvent.resource.organizer.url,
								id: requiredEvent.resource.organizer.a ?? requiredEvent.resource.organizer.url
							}
						],
						panel: false,
						disabled: {
							title: true,
							location: true,
							organizer: true,
							virtualRoom: true,
							richTextButton: true,
							attachmentsButton: true,
							saveButton: true,
							attendees: true,
							optionalAttendees: true,
							freeBusy: true,
							calendar: true,
							private: true,
							allDay: true,
							reminder: true,
							recurrence: true,
							meetingRoom: true,
							equipment: true,
							timezone: true
						}
					}
				});
				if (editor.id) {
					addBoard({
						url: `${CALENDAR_ROUTE}/`,
						title: editor?.title ?? '',
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						editor
					} as unknown as Board);
				}
			}
		});
	}, [calendarFolders, dispatch, inviteId]);

	const { localTimeString, localTimezoneString, showTimezoneTooltip, localTimezoneTooltip } =
		useGetEventTimezoneString(invite.start.u, invite.end.u, invite.allDay, invite.tz);

	const messageHasABody = useMemo(() => {
		const body = extractBody(invite?.textDescription?.[0]?._content);
		return body?.length > 0;
	}, [invite?.textDescription]);

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
							<Text weight="regular" size="large" style={{ fontSize: '1.125rem' }}>
								{`${invite.organizer?.d ?? invite.organizer?.a} ${t(
									'message.invited_you',
									'invited you to '
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
				{method === 'COUNTER'
					? parent !== '5' && (
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
					: isAttendee && (
							// eslint-disable-next-line react/jsx-indent
							<InviteReplyPart
								inviteId={inviteId}
								participationStatus={participationStatus}
								proposeNewTime={proposeNewTimeCb}
								parent={parent}
							/>
					  )}

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

				{meetingRooms?.length && (
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

				{haveEquipment && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'small' }}>
						<Tooltip placement="left" label={t('tooltip.equipment', 'Equipment')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="BriefcaseOutline" />
							</Row>
						</Tooltip>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={t('tooltip.equipment', 'Equipment')}>
								<Text size="medium" overflow="break-word">
									{/* TODO: Equipment name */}
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
										defaultValue: '{{count}} Participant',
										defaultValue_plural: '{{count}} Participants'
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
												background="gray3"
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
										background="gray3"
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
							{requiredParticipants.map((p, index: number) => (
								<>
									{index < maxReqParticipantsToShow && (
										<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
											{p.d ? (
												<Tooltip placement="top" label={p.a} maxWidth="100%">
													<div>
														<Chip
															label={p.d}
															background="gray3"
															color="text"
															actions={[
																{
																	id: 'action2',
																	label: t('message.send_email'),
																	type: 'button',
																	icon: 'EmailOutline',
																	onClick: () => replyMsg(p)
																}
															]}
														/>
													</div>
												</Tooltip>
											) : (
												<Chip
													label={p.a}
													background="gray3"
													color="text"
													actions={[
														{
															id: 'action2',
															label: t('message.send_email'),
															type: 'button',
															icon: 'EmailOutline',
															onClick: () => replyMsg(p)
														}
													]}
												/>
											)}
										</Row>
									)}
								</>
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
											defaultValue: '{{count}} Optional',
											defaultValue_plural: '{{count}} Optionals'
										})}
									</Text>
								</Row>
								{optionalParticipants.map((p, index: number) => (
									<>
										{index < maxOptParticipantsToShow && (
											<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
												{p.d ? (
													<Tooltip placement="top" label={p.a} maxWidth="100%">
														<div>
															<Chip
																label={p.d}
																background="gray3"
																color="text"
																actions={[
																	{
																		id: 'action2',
																		label: t('message.send_email'),
																		type: 'button',
																		icon: 'EmailOutline',
																		onClick: () => replyMsg(p)
																	}
																]}
															/>
														</div>
													</Tooltip>
												) : (
													<Chip
														label={p.a}
														background="gray3"
														color="text"
														actions={[
															{
																id: 'action2',
																label: t('message.send_email'),
																type: 'button',
																icon: 'EmailOutline',
																onClick: () => replyMsg(p)
															}
														]}
													/>
												)}
											</Row>
										)}
									</>
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

const InviteResponseComp: FC<InviteResponse> = (props) => (
	<StoreProvider>
		<InviteResponse {...props} />
	</StoreProvider>
);
export default InviteResponseComp;
