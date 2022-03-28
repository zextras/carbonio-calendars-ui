/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { includes, isNil, map, omitBy, startsWith } from 'lodash';
import moment from 'moment';
import { HTML_ROOM_DIVIDER, ROOM_DIVIDER } from '../../commons/body-message-renderer';
import { METADATA_SECTIONS } from '../../constants/metadata';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const generateParticipantInformation = (attendees: Array<any>): any =>
	map(attendees, (attendee) => ({
		a: attendee.email,
		p:
			attendee.firstName && attendee.lastname
				? `${attendee.firstName} ${attendee.lastname}`
				: attendee.label,
		t: 't'
	}));

function generateHtmlBodyRequest(
	app: {
		resource: {
			attendees: any;
			optionalAttendees: any;
			location: any;
			richText: any;
			room: { label: string; link: string };
		};
		allDay: any;
		start: moment.MomentInput;
		end: moment.MomentInput;
		title: any;
	},
	account: { displayName: any; name: any }
): any {
	const attendees = [...app.resource.attendees, ...app.resource.optionalAttendees]
		.map((a) => a.email)
		.join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const intro = 'The following is a new meeting request';
	const virtualRoomHtml =
		app?.resource?.room && !includes(app.resource.richText, ROOM_DIVIDER)
			? `${ROOM_DIVIDER}<h3>${account.displayName} invited you to a virtual meeting on Carbonio Chats system.</h3><p>Join the meeting now on <a href= app.resource.room.link>${app.resource.room.label}</a></p><p>You can join the meeting via Web or by using native applications:</p><a href="https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US">https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US</a><br/><a href="https://apps.apple.com/it/app/zextras-team/id1459844854">https://apps.apple.com/it/app/zextras-team/id1459844854</a>${ROOM_DIVIDER}`
			: '';
	return `<html><body id='htmlmode'>
<h3>${intro}:</h3>
<p>
<table border='0'>
<tr><th align=left>Subject:</th><td>${app.title}</td></tr>
<tr><th align=left>Organizer:</th><td>"${account.displayName}" <${account.name}> </td></tr>
</table>
<p>
<table border='0'>
<tr><th align=left>Location:</th><td>${app.resource.location} </td></tr>
<tr><th align=left>Time:</th><td> ${date}
 </td></tr></table>
<p>
<table border='0'>
<tr><th align=left>Invitees:</th><td>${attendees}</td></tr>
</table>
<div>*~*~*~*~*~*~*~*~*~*</div><br>${virtualRoomHtml}${app.resource.richText}`;
}

function generateBodyRequest(
	app: {
		resource: {
			attendees: any;
			optionalAttendees: any;
			plainText: any;
			room: { label: string; link: string };
		};
		allDay: any;
		start: moment.MomentInput;
		end: moment.MomentInput;
		title: any;
	},
	account: { displayName: any; name: any }
): any {
	const attendees = [...app.resource.attendees, ...app.resource.optionalAttendees]
		.map((a) => a.email)
		.join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const intro = 'The following is a new meeting request';
	const virtualRoom = app?.resource?.room?.label
		? `-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n${account.name} have invited you to a virtual meeting on Carbonio Chats system\n\nJoin the meeting now on ${app.resource.room.label}\n\n${app.resource.room.link} \n\nYou can join the meeting via Web or by using native applications:\n\nhttps://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US\n\nhttps://apps.apple.com/it/app/zextras-team/id1459844854\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::- \n`
		: undefined;
	return `${intro}:\n\nSubject: ${app.title} \nOrganizer: "${account.displayName}" <${
		account.name
	}>\n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n*~*~*~*~*~*~*~*~*~*\n\n${
		virtualRoom ? `${virtualRoom}\n\n` : ''
	}${app.resource.plainText}`;
}

const generateMp = (msg: any, account: any): any => ({
	ct: 'multipart/alternative',
	mp: msg.resource.isRichText
		? [
				{
					ct: 'text/html',
					content: generateHtmlBodyRequest(msg, account)
				},
				{
					ct: 'text/plain',
					content: generateBodyRequest(msg, account)
				}
		  ]
		: [
				{
					ct: 'text/plain',
					content: generateBodyRequest(msg, account)
				}
		  ]
});

const generateInvite = (editorData: any): any => {
	const at = [];
	at.push(
		...editorData.resource.attendees.map((c: any) => ({
			a: c.email,
			d: c.firstName && c.lastname ? `${c.firstName} ${c.lastname}` : c.label,
			role: 'REQ',
			ptst: 'NE',
			rsvp: '1'
		}))
	);

	editorData?.resource?.optionalAttendees &&
		at.push(
			...editorData.resource.optionalAttendees.map((c: any) => ({
				a: c.email,
				d: c.firstName && c.lastname ? `${c.firstName} ${c.lastname}` : c.label,
				role: 'OPT',
				ptst: 'NE',
				rsvp: '1'
			}))
		);

	return {
		comp: [
			{
				alarm:
					editorData.resource.alarm !== 'never'
						? [
								{
									action: 'DISPLAY',
									trigger: {
										rel: {
											m: editorData.resource.alarm,
											related: 'START',
											neg: '1'
										}
									}
								}
						  ]
						: undefined,
				at,
				allDay: editorData.allDay ? '1' : '0',
				fb: editorData.allDay ? 'F' : editorData.resource.freeBusy,
				loc: editorData.resource.location,
				name: editorData.title,
				or: {
					a: editorData.resource.organizer.email,
					d: editorData.resource.organizer.name,
					sentBy: editorData.resource.organizer?.sentBy
				},
				recur: editorData?.resource?.recur ?? null,
				status: editorData.resource.status,
				s:
					editorData.allDay || editorData?.resource?.tz
						? omitBy(
								{
									d: moment(editorData.start).format('YYYYMMDD'),
									tz: editorData?.resource?.tz
								},
								isNil
						  )
						: {
								d: moment(editorData.start).utc().format('YYYYMMDD[T]HHmmss[Z]')
						  },
				e:
					editorData.allDay || editorData?.resource?.tz
						? omitBy(
								{
									d: moment(editorData.end).format('YYYYMMDD'),
									tz: editorData?.resource?.tz
								},
								isNil
						  )
						: {
								d: moment(editorData.end).utc().format('YYYYMMDD[T]HHmmss[Z]')
						  },
				class: editorData.resource.class,
				draft: editorData.resource.isDraft
			}
		],
		uid: editorData.resource.uid
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateSoapMessageFromEditor = (msg: any, account: any): any =>
	omitBy(
		{
			echo: '1',
			id: msg?.resource?.inviteId,
			comp: '0',
			m: omitBy(
				{
					attach: msg?.resource?.attach
						? {
								mp: msg?.resource?.attach?.mp,
								aid:
									msg?.resource?.attach?.aid?.length > 0
										? msg?.resource?.attach?.aid?.join(',')
										: null
						  }
						: null,
					e: generateParticipantInformation(msg?.resource?.attendees).concat({
						a: msg.resource.organizer.email,
						p: msg.resource.organizer.name,
						t: 'f'
					}),
					inv: generateInvite(msg),
					l: msg?.resource?.calendar?.id,
					mp: generateMp(msg, account),
					su: msg?.title
				},
				isNil
			),
			_jsns: 'urn:zimbraMail'
		},
		isNil
	);

export const createAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ editor, account }: any): Promise<any> => {
		const body = generateSoapMessageFromEditor(editor, account);
		const res: { calItemId: string } = await soapFetch('CreateAppointment', body);
		if (res?.calItemId) {
			await soapFetch('SetCustomMetadata', {
				_jsns: 'urn:zimbraMail',
				id: res.calItemId,
				meta: {
					section: METADATA_SECTIONS.MEETING_ROOM,
					_attrs: {
						room: editor.resource.room.label,
						link: editor.resource.room.link
					}
				}
			});
		}
		return res;
	}
);
