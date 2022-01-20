/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

function generateBodyRequest(
	app: {
		resource: { attendees: any; optionalAttendees: any; plainText: any };
		allDay: string;
		start: moment.MomentInput;
		end: moment.MomentInput;
		title: string;
	},
	invite: any,
	account: { displayName: any; name: any }
): any {
	const attendees = invite.attendees.map((a: any) => a.email).join(', ');
	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const intro = 'The following meeting has been modified';
	return `${intro}:\n\nSubject: ${app.title} [MODIFIED]\nOrganizer: "${account.displayName}" <${
		account.name
	}>\n\nTime: ${date} [MODIFIED]\n \nInvitees: ${attendees} \n\n\n*~*~*~*~*~*~*~*~*~*\n\n${
		app?.resource?.plainText ?? ''
	}`;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const modifyAppointmentRequest = createAsyncThunk(
	'appointment/accept-proposed-time',
	async ({ appt, invite, mailInvite, account }: any): Promise<unknown> => {
		const at = [];
		at.push(
			...invite.attendees.map(
				(c: { a: string; role: string; ptst: string; rsvp: string; d: string }) => c
			)
		);
		invite.optionalAttendees &&
			at.push(
				...invite.optionalAttendees.map((c: { a: any }) => ({
					a: c.a,
					role: 'OPT',
					ptst: 'NE'
				}))
			);
		const e = at.map((attendee) => ({
			a: attendee.a,
			t: 't'
		}));

		const result = await soapFetch('ModifyAppointment', {
			id: appt.resource.inviteId,
			comp: '0',
			m: {
				attach: appt.resource.attach
					? {
							mp: appt.resource.attach?.mp,
							aid:
								appt.resource.attach?.aid?.length > 0 ? appt.resource.attach?.aid?.join(',') : null
					  }
					: null,
				su: appt.title,
				l: appt.resource.calendar.id,
				e,
				inv: {
					comp: [
						{
							alarm:
								appt.alarm !== 'never'
									? [
											{
												action: 'DISPLAY',
												trigger: {
													rel: {
														m: Number(invite.alarmValue),
														related: 'START',
														neg: '1'
													}
												}
											}
									  ]
									: undefined,
							at,
							allDay: appt.allDay ? '1' : '0',
							fb: appt.resource.freeBusy,
							loc: appt.resource.location,
							name: appt.title,
							or: {
								a: appt.resource.organizer.a,
								d: appt.resource.organizer.name || appt.resource.organizer.url
							},
							recur: invite.recurrenceRule ?? null,
							status: 'CONF',
							transp: 'O',
							s: {
								d: moment(moment(mailInvite[0].comp?.[0]?.s?.[0]?.u).utc()).format(
									'YYYYMMDD[T]HHmmss[Z]'
								)
							},
							e: {
								d: moment(moment(mailInvite[0].comp?.[0]?.e?.[0]?.u).utc()).format(
									'YYYYMMDD[T]HHmmss[Z]'
								)
							},
							class: appt.resource.class,
							draft: 0
						}
					],
					uid: appt.resource.uid
				},
				mp: {
					ct: 'multipart/alternative',
					mp: [
						{
							ct: 'text/plain',
							content: generateBodyRequest(appt, invite, account)
						}
					]
				}
			},
			ms: appt.resource.ms,
			rev: appt.resource.rev,
			_jsns: 'urn:zimbraMail'
		});
		return result;
	}
);
