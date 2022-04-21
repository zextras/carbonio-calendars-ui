/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { concat, includes, isNil, map, omitBy } from 'lodash';
import moment from 'moment';
import { ROOM_DIVIDER } from '../../commons/body-message-renderer';
import { METADATA_SECTIONS } from '../../constants/metadata';

type Participants = {
	a: string | undefined;
	p: string | undefined;
	t: string;
};
type Resource = {
	organizer: { email: string; name: string };
	attendees: Array<{ email: string; firstName?: string; lastname?: string; label?: string }>;
	optionalAttendees: Array<{
		email: string;
		firstName?: string;
		lastname?: string;
		label?: string;
	}>;
	draft: boolean;
};

const generateParticipantInformation = (resource: Resource): Array<Participants> =>
	resource?.draft
		? [
				{
					a: resource?.organizer?.email,
					p: resource?.organizer?.name,
					t: 'f'
				}
		  ]
		: concat(
				map(concat(resource?.attendees, resource?.optionalAttendees), (attendee) => ({
					a: attendee.email,
					p:
						attendee.firstName && attendee.lastname
							? `${attendee.firstName} ${attendee.lastname}`
							: attendee.label,
					t: 't'
				})),
				{ a: resource?.organizer?.email, p: resource?.organizer?.name, t: 'f' }
		  );

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

	const meetingHtml = `${ROOM_DIVIDER}<h3>${account.displayName} have invited you to a new meeting!</h3><p>Subject: ${app.title}</p><p>Organizer: ${account.displayName} ${account.name}</p><p>Location: ${app.resource.location}</p><p>Time: ${date}</p><p>Invitess: ${attendees}</p>${ROOM_DIVIDER}`;
	const virtualRoomHtml = app.resource?.room?.label
		? `${ROOM_DIVIDER}<h3>${account.displayName} invited you to a virtual meeting on Carbonio Chats system.</h3><p>Join the meeting now on <a href= app.resource.room.link>${app.resource.room.label}</a></p><p>You can join the meeting via Web or by using native applications:</p><a href="https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US">https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US</a><br/><a href="https://apps.apple.com/it/app/zextras-team/id1459844854">https://apps.apple.com/it/app/zextras-team/id1459844854</a>${ROOM_DIVIDER}`
		: '';
	const defaultMessage =
		app?.resource?.room && !includes(app.resource.richText, ROOM_DIVIDER)
			? virtualRoomHtml
			: meetingHtml;
	return `<html><body id='htmlmode'>${defaultMessage}${app.resource.richText}`;
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

	const virtualRoomMessage = app.resource?.room?.label
		? `-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n${
				account.displayName ?? ''
		  }  ${
				account.name ?? ''
		  } have invited you to a virtual meeting on Carbonio Chats system!\n\nJoin the meeting now on ${
				app.resource.room.label
		  }\n\n${
				app.resource.room.link
		  } \n\nYou can join the meeting via Web or by using native applications:\n\nhttps://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US\n\nhttps://apps.apple.com/it/app/zextras-team/id1459844854\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::- \n`
		: '';
	const meetingMessage = `-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n${
		account.displayName ?? ''
	}  ${account.name ?? ''} have invited you to a new meeting!\n\nSubject: ${
		app.title
	} \nOrganizer: "${account.displayName} ${
		account.name
	}\n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-`;
	const defaultMessage = app?.resource?.room?.label ? virtualRoomMessage : meetingMessage;

	return `${defaultMessage}\n${app.resource.plainText}`;
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
				fb: editorData.resource.freeBusy,
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
				draft: editorData.resource.draft
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
					e: generateParticipantInformation(msg?.resource),
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
