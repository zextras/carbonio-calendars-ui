/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { compact, concat, includes, isNil, map, omitBy } from 'lodash';
import moment from 'moment';

import {
	CALENDAR_RESOURCES,
	HTML_CLOSING_TAG,
	HTML_OPENING_TAG,
	ROOM_DIVIDER
} from '../../constants';
import { CRB_XPARAMS, CRB_XPROPS } from '../../constants/xprops';
import { Editor } from '../../types/editor';

type Participants = {
	a?: string;
	p?: string;
	t: string;
};

const setResourceDate = ({
	time,
	allDay = false,
	timezone
}: {
	time: number | undefined;
	allDay?: boolean;
	timezone?: string;
}): any => {
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

const isEventSentFromOrganizer = (organizer: any, sender: any): boolean =>
	organizer.address === sender?.address &&
	organizer.label === sender.label &&
	organizer.identityName === sender.identityName;

export const generateParticipantInformation = (resource: Editor): Array<Participants> => {
	const sender = isEventSentFromOrganizer(resource.organizer, resource.sender)
		? undefined
		: {
				a: resource?.sender?.address ?? resource?.sender?.label,
				p: resource?.sender?.fullName,
				t: 's'
		  };
	const organizerParticipant = resource.calendar?.owner
		? compact([
				{
					a: resource.calendar?.owner,
					t: 'f'
				},
				sender
		  ])
		: compact([
				{
					a: resource?.organizer?.address ?? resource?.organizer?.label,
					p: resource?.organizer?.fullName,
					t: 'f'
				},
				sender
		  ]);
	return resource?.draft
		? organizerParticipant
		: concat(
				map(concat(resource?.attendees, resource?.optionalAttendees), (attendee) => ({
					a: attendee?.email ?? attendee?.label,
					p:
						attendee?.firstName && attendee?.lastname
							? `${attendee.firstName} ${attendee.lastname}`
							: attendee.label,
					t: 't'
				})),
				organizerParticipant
		  );
};

function generateHtmlBodyRequest(app: Editor): string {
	const attendees = [...app.attendees, ...app.optionalAttendees].map((a) => a.email).join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const meetingHtml = `${ROOM_DIVIDER}<h3>${app.organizer.fullName} have invited you to a new meeting!</h3><p>Subject: ${app.title}</p><p>Organizer: ${app.organizer.fullName}</p><p>Location: ${app.location}</p><p>Time: ${date}</p><p>Invitees: ${attendees}</p><br/>${ROOM_DIVIDER}`;
	const virtualRoomHtml = app?.room?.label
		? `${ROOM_DIVIDER}<h3>${app.organizer.fullName} invited you to a virtual meeting on Carbonio Chats system.</h3><p>Join the meeting now on <a href="${app.room.link}">${app.room.label}</a></p><p>You can join the meeting via Web or by using native applications:</p><a href="https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US">https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US</a><br/><a href="https://apps.apple.com/it/app/zextras-team/id1459844854">https://apps.apple.com/it/app/zextras-team/id1459844854</a><br/>${ROOM_DIVIDER}`
		: '';
	const defaultMessage =
		app?.room && !includes(app.richText, ROOM_DIVIDER) ? virtualRoomHtml : meetingHtml;
	return `${HTML_OPENING_TAG}${defaultMessage}${app.richText}${HTML_CLOSING_TAG}`;
}

function generateBodyRequest(app: Editor): string {
	const attendees = [...app.attendees, ...app.optionalAttendees].map((a) => a.email).join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const virtualRoomMessage = app?.room?.label
		? `${ROOM_DIVIDER}\n${
				app.organizer.fullName ?? ''
		  } have invited you to a virtual meeting on Carbonio Chats system!\n\nJoin the meeting now on ${
				app.room.label
		  }\n\n${
				app.room.link
		  } \n\nYou can join the meeting via Web or by using native applications:\n\nhttps://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US\n\nhttps://apps.apple.com/it/app/zextras-team/id1459844854\n\n${ROOM_DIVIDER}\n`
		: '';
	const meetingMessage = `${ROOM_DIVIDER}\n${
		app.organizer.fullName ?? ''
	} have invited you to a new meeting!\n\nSubject: ${app.title} \nOrganizer: "${
		app.organizer.fullName
	} \n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n${ROOM_DIVIDER}`;
	const defaultMessage = app?.room?.label ? virtualRoomMessage : meetingMessage;

	return `${defaultMessage}\n${app.plainText}`;
}

const generateMp = (msg: Editor): any => ({
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

	at.push(
		...editorData.attendees.map((c: any) => ({
			a: c?.email ?? c?.label,
			d: c?.firstName && c?.lastname ? `${c.firstName} ${c.lastname}` : c.label,
			role: 'REQ',
			ptst: 'NE',
			rsvp: '1'
		}))
	);
	editorData?.optionalAttendees &&
		at.push(
			...editorData.optionalAttendees.map((c: any) => ({
				a: c?.email ?? c?.label,
				d: c.firstName && c.lastname ? `${c.firstName} ${c.lastname}` : c.label,
				role: 'OPT',
				ptst: 'NE',
				rsvp: '1'
			}))
		);

	editorData?.meetingRoom &&
		at.push(
			...editorData.meetingRoom.map((c) => ({
				a: c?.email,
				d: c.label,
				role: 'NON',
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
				role: 'NON',
				ptst: 'NE',
				rsvp: true,
				url: c?.email,
				cutype: CALENDAR_RESOURCES.RESOURCE
			}))
		);

	const isAlsoSender = isEventSentFromOrganizer(editorData.organizer, editorData.sender);
	const organizer = editorData.calendar?.owner
		? {
				a: editorData.calendar.owner,
				sentBy: editorData.sender.address
		  }
		: omitBy(
				{
					a: editorData.organizer.address,
					d: isAlsoSender ? undefined : editorData.organizer.fullName,
					sentBy: isAlsoSender ? undefined : editorData.sender.address
				},
				isNil
		  );
	return {
		comp: [
			{
				alarm:
					editorData?.reminder !== 'never' && editorData.reminder !== 'undefined'
						? [
								{
									action: 'DISPLAY',
									trigger: {
										rel: {
											m: editorData.reminder,
											related: 'START',
											neg: '1'
										}
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
				or: organizer,
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateSoapMessageFromEditor = (msg: Editor): any =>
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

// todo: this thunk is not using redux! convert to regular async function
export const createAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ draft, editor }: any, { rejectWithValue }: any): Promise<any> => {
		if (editor) {
			const body = generateSoapMessageFromEditor({ ...editor, draft });
			const res: { calItemId: string; invId: string } = await soapFetch('CreateAppointment', body);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const response = res?.Fault ? { ...res.Fault, error: true } : res;
			if (response?.error) {
				return rejectWithValue(response);
			}
			return {
				response: res,
				editor: {
					...editor,
					isNew: false,
					isSeries: !!editor.recur,
					isInstance: !editor.recur,
					isException: false,
					inviteId: res.invId
				}
			};
		}
		return undefined;
	}
);
