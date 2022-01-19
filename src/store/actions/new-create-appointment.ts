/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, map, omitBy } from 'lodash';
import moment from 'moment';

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
		resource: { attendees: any; optionalAttendees: any; location: any; richText: any };
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

	return `<html><body id='htmlmode'><h3>${intro}:</h3>
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
<div>*~*~*~*~*~*~*~*~*~*</div><br>${app.resource.richText}`;
}

function generateBodyRequest(
	app: {
		resource: { attendees: any; optionalAttendees: any; plainText: any };
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

	return `${intro}:\n\nSubject: ${app.title} \nOrganizer: "${account.displayName}" <${account.name}>\n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n*~*~*~*~*~*~*~*~*~*\n\n${app.resource.plainText}`;
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
			ptst: 'NE'
		}))
	);

	editorData?.resource?.optionalAttendees &&
		at.push(
			...editorData.resource.optionalAttendees.map((c: any) => ({
				a: c.email,
				d: c.firstName && c.lastname ? `${c.firstName} ${c.lastname}` : c.label,
				role: 'OPT',
				ptst: 'NE'
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
		const res = await soapFetch('CreateAppointment', body);
		return res;
	}
);
