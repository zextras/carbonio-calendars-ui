/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { compact, concat, includes, isNil, map, omitBy } from 'lodash';
import moment from 'moment';

import { Rel } from './normalizations-utils';
import { CALENDAR_RESOURCES, HTML_CLOSING_TAG, HTML_OPENING_TAG, ROOM_DIVIDER } from '../constants';
import { PARTICIPANT_ROLE } from '../constants/api';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { getTimeString } from '../hooks/use-get-event-timezone';
import { CalendarEditor, CalendarOrganizer, CalendarSender, Editor } from '../types/editor';
import {
	isDaysInMinutes,
	isHoursInMinutes,
	isWeeksInMinutes,
	minutesToDays,
	minutesToHours,
	minutesToWeeks
} from '../utils/times';

type Participants = {
	a?: string;
	p?: string;
	t: string;
};

const isEventSentFromOrganizer = (organizer: string, sender: { address: string }): boolean =>
	organizer === sender.address;

const isTheSameIdentity = (
	organizer: { identityName: string },
	sender: { identityName: string }
): boolean => organizer.identityName === sender.identityName;

const isTheSameEmail = (organizer: string, sender: { address: string }): boolean =>
	organizer === sender.address;

const setResourceDate = ({
	time,
	allDay = false,
	timezone
}: {
	time: number | undefined;
	allDay?: boolean;
	timezone?: string;
}): { d: string; tz?: string } => {
	if (allDay) {
		return {
			d: moment(time).startOf('day').format('YYYYMMDD')
		};
	}
	return timezone
		? {
				d: moment(time).format('YYYYMMDD[T]HHmmss'),
				tz: timezone
			}
		: {
				d: moment(time).utc().format('YYYYMMDD[T]HHmmss[Z]')
			};
};

export const setAlarmValue = (reminderInMinutes: string): { related: 'START'; neg: '1' } & Rel => {
	const minutes = parseFloat(reminderInMinutes);
	const AT_THE_TIME_OF_THE_EVENT = -1;

	const unchangedProps = {
		related: 'START',
		neg: '1'
	} as const;

	if (isWeeksInMinutes(minutes)) {
		return {
			w: minutesToWeeks(minutes),
			...unchangedProps
		};
	}
	if (isDaysInMinutes(minutes)) {
		return {
			d: minutesToDays(minutes),
			...unchangedProps
		};
	}
	if (isHoursInMinutes(minutes)) {
		return {
			h: minutesToHours(minutes),
			...unchangedProps
		};
	}
	if (minutes === AT_THE_TIME_OF_THE_EVENT) {
		return {
			m: 0,
			...unchangedProps
		};
	}
	return {
		m: minutes,
		related: 'START',
		neg: '1'
	};
};

export const generateParticipantInformation = (resource: Editor): Array<Partial<Participants>> => {
	const user = getUserAccount();
	const iAmOrganizer = isEventSentFromOrganizer(user?.name ?? '', resource.sender);
	const isSameIdentity = isTheSameIdentity(resource.organizer, resource.sender);
	const isNotMyCalendar = resource.calendar?.owner;
	const isSharedAccount = isTheSameEmail(resource.calendar?.owner ?? '', resource.sender);

	const mainAccountOrganizer = omitBy<Participants>(
		{
			a: user?.name,
			p: resource?.organizer?.fullName,
			t: 'f'
		},
		isNil
	);

	const sharedCalendarOrganizer = {
		a: resource.calendar?.owner,
		t: 'f'
	};

	const sender = omitBy<Participants>(
		{
			a: resource?.sender?.address ?? resource?.sender?.label,
			p: resource?.sender?.fullName,
			t: 's'
		},
		isNil
	);

	const organizer = isNotMyCalendar ? sharedCalendarOrganizer : mainAccountOrganizer;
	const sentFrom =
		(iAmOrganizer && isSameIdentity && !isNotMyCalendar) || isSharedAccount ? undefined : sender;

	const organizerParticipant = compact([organizer, sentFrom]);
	return resource?.draft
		? organizerParticipant
		: concat<Partial<Participants>>(
				map(
					concat(
						resource?.attendees,
						resource?.optionalAttendees,
						resource?.meetingRoom ?? [],
						resource?.equipment ?? []
					),
					(attendee) => ({
						a: attendee?.email ?? attendee?.label,
						p:
							attendee?.firstName && attendee?.lastname
								? `${attendee.firstName} ${attendee.lastname}`
								: attendee.label,
						t: 't'
					})
				),
				organizerParticipant
			);
};

const getOrganizer = ({
	calendar,
	sender,
	organizer
}: {
	calendar?: CalendarEditor;
	sender: CalendarSender;
	organizer: CalendarOrganizer;
}): { email?: string; name?: string; sentBy?: string } => {
	const user = getUserAccount();

	const isAlsoSender = isEventSentFromOrganizer(user?.name ?? '', sender);
	const isSameIdentity = isTheSameIdentity(organizer, sender);
	const isSameEmail = isTheSameEmail(user?.name ?? '', sender);
	const isSharedAccount = isTheSameEmail(calendar?.owner ?? '', sender);

	if (!calendar?.owner) {
		if (isAlsoSender && isSameIdentity) {
			return omitBy(
				{
					email: user?.name,
					name: organizer.fullName,
					sentBy: isSameEmail ? undefined : sender.address
				},
				isNil
			);
		}
		return omitBy(
			{
				email: user?.name,
				name: sender.fullName,
				sentBy: isSameEmail ? undefined : sender.address
			},
			isNil
		);
	}
	if (isSharedAccount) {
		return {
			email: calendar.owner,
			name: sender.fullName
		};
	}
	return {
		email: calendar.owner,
		sentBy: sender.address
	};
};

function generateHtmlBodyRequest(app: Editor): string {
	const attendees = [...app.attendees, ...app.optionalAttendees].map((a) => a.email).join(', ');
	const organizer = getOrganizer({
		calendar: app?.calendar,
		sender: app.sender,
		organizer: app.organizer
	});
	const date = getTimeString(app.start, app.end, app.allDay, 'allDay');

	const meetingHtml = `${ROOM_DIVIDER}<h3>${organizer.name} have invited you to a new meeting!</h3><p>Subject: ${app.title}</p><p>Organizer: ${organizer.name}</p><p>Location: ${app.location}</p><p>Time: ${date}</p><p>Invitees: ${attendees}</p><br/>${ROOM_DIVIDER}`;
	const virtualRoomHtml = app?.room?.label
		? `${ROOM_DIVIDER}<h3>${organizer.name} invited you to a virtual meeting on Carbonio Chats system.</h3><p>Join the meeting now on <a href="${app.room.link}">${app.room.label}</a></p><p>You can join the meeting via Web or by using native applications:</p><a href="https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US">https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US</a><br/><a href="https://apps.apple.com/it/app/zextras-team/id1459844854">https://apps.apple.com/it/app/zextras-team/id1459844854</a><br/>${ROOM_DIVIDER}`
		: '';
	const defaultMessage =
		app?.room && !includes(app.richText, ROOM_DIVIDER) ? virtualRoomHtml : meetingHtml;
	return attendees?.length
		? `${HTML_OPENING_TAG}${defaultMessage}${app.richText}${HTML_CLOSING_TAG}`
		: app.richText;
}

function generateBodyRequest(app: Editor): string {
	const attendees = [...app.attendees, ...app.optionalAttendees].map((a) => a.email).join(', ');
	const organizer = getOrganizer({
		calendar: app?.calendar,
		sender: app.sender,
		organizer: app.organizer
	});
	const date = getTimeString(app.start, app.end, app.allDay, 'allDay');

	const virtualRoomMessage = app?.room?.label
		? `${ROOM_DIVIDER}\n${
				organizer.name ?? ''
			} have invited you to a virtual meeting on Carbonio Chats system!\n\nJoin the meeting now on ${
				app.room.label
			}\n\n${
				app.room.link
			} \n\nYou can join the meeting via Web or by using native applications:\n\nhttps://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US\n\nhttps://apps.apple.com/it/app/zextras-team/id1459844854\n\n${ROOM_DIVIDER}\n`
		: '';
	const meetingMessage = `${ROOM_DIVIDER}\n${
		organizer.name ?? ''
	} have invited you to a new meeting!\n\nSubject: ${app.title} \nOrganizer: "${
		organizer.name
	} \n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n${ROOM_DIVIDER}`;
	const defaultMessage = app?.room?.label ? virtualRoomMessage : meetingMessage;

	return attendees?.length ? `${defaultMessage}\n${app.plainText}` : app.plainText;
}

const generateMp = (msg: Editor): { ct: string; mp: Array<{ ct: string; content: string }> } => ({
	ct: 'multipart/alternative',
	mp: msg.isRichText
		? [
				{
					ct: 'text/html',
					content: generateHtmlBodyRequest(msg)
				},
				{
					ct: 'text/plain',
					content: generateBodyRequest(msg)
				}
			]
		: [
				{
					ct: 'text/plain',
					content: generateBodyRequest(msg)
				}
			]
});

const generateInvite = (editorData: Editor): any => {
	const at = [];
	const organizer = getOrganizer({
		calendar: editorData?.calendar,
		sender: editorData.sender,
		organizer: editorData.organizer
	});
	at.push(
		...editorData.attendees.map((c: any) => ({
			a: c?.email ?? c?.label,
			d: c?.firstName && c?.lastname ? `${c.firstName} ${c.lastname}` : c.label,
			role: PARTICIPANT_ROLE.REQUIRED,
			ptst: 'NE',
			rsvp: '1'
		}))
	);
	editorData?.optionalAttendees &&
		at.push(
			...editorData.optionalAttendees.map((c: any) => ({
				a: c?.email ?? c?.label,
				d: c.firstName && c.lastname ? `${c.firstName} ${c.lastname}` : c.label,
				role: PARTICIPANT_ROLE.OPTIONAL,
				ptst: 'NE',
				rsvp: '1'
			}))
		);

	editorData?.meetingRoom &&
		at.push(
			...editorData.meetingRoom.map((c) => ({
				a: c?.email,
				d: c.label,
				role: PARTICIPANT_ROLE.NON_PARTICIPANT,
				ptst: 'NE',
				rsvp: true,
				url: c?.email,
				cutype: CALENDAR_RESOURCES.ROOM
			}))
		);

	editorData?.equipment &&
		at.push(
			...editorData.equipment.map((c) => ({
				a: c?.email,
				d: c.label,
				role: PARTICIPANT_ROLE.NON_PARTICIPANT,
				ptst: 'NE',
				rsvp: true,
				url: c?.email,
				cutype: CALENDAR_RESOURCES.RESOURCE
			}))
		);

	return {
		comp: [
			{
				alarm:
					editorData?.reminder && editorData?.reminder !== '0'
						? [
								{
									action: 'DISPLAY',
									trigger: {
										rel: setAlarmValue(editorData.reminder)
									}
								}
							]
						: undefined,
				xprop: editorData?.room
					? [
							{
								name: CRB_XPROPS.MEETING_ROOM,
								value: CRB_XPROPS.MEETING_ROOM,
								xparam: [
									{
										name: CRB_XPARAMS.ROOM_LINK,
										value: editorData.room.link
									},
									{
										name: CRB_XPARAMS.ROOM_NAME,
										value: editorData.room.label
									}
								]
							}
						]
					: undefined,
				at,
				allDay: editorData.allDay ? '1' : '0',
				fb: editorData.freeBusy,
				loc: editorData.location,
				name: editorData.title,
				or: omitBy(
					{
						a: organizer.email,
						d: organizer.name,
						sentBy: organizer.sentBy
					},
					isNil
				),
				recur:
					(editorData?.isInstance && editorData?.isSeries) || editorData?.isException
						? undefined
						: editorData?.recur,
				status: 'CONF',
				s: setResourceDate({
					time: editorData.start,
					allDay: editorData?.allDay,
					timezone: editorData?.timezone
				}),
				e: setResourceDate({
					time: editorData.end,
					allDay: editorData?.allDay,
					timezone: editorData?.timezone
				}),
				exceptId: editorData.exceptId,
				class: editorData.class,
				draft: editorData.draft ? 1 : 0
			}
		],
		uid: editorData.uid
	};
};

export const normalizeSoapMessageFromEditor = (msg: Editor): any =>
	omitBy(
		{
			echo: '1',
			id: msg?.inviteId,
			comp: '0',
			m: omitBy(
				{
					attach: msg?.attach
						? {
								mp: msg?.attach?.mp,
								aid: msg?.attach?.aid?.length > 0 ? msg?.attach?.aid?.join(',') : undefined
							}
						: undefined,
					e: generateParticipantInformation(msg),
					inv: generateInvite(msg),
					l: msg?.calendar?.id,
					mp: generateMp(msg),
					su: msg?.title
				},
				isNil
			),
			_jsns: 'urn:zimbraMail'
		},
		isNil
	);
