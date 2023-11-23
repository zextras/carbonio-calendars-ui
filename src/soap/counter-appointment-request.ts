/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import { generateParticipantInformation } from '../normalizations/normalize-soap-message-from-editor';

export const counterAppointmentRequest = async ({ appt }: { appt: any }): Promise<any> =>
	soapFetch('CounterAppointment', {
		_jsns: 'urn:zimbraMail',
		comp: '0',
		id: appt.inviteId,
		ms: appt.ms,
		rev: appt.rev,
		m: {
			e: generateParticipantInformation(appt),
			inv: {
				comp: [
					{
						name: appt.title,
						uid: appt.uid,
						seq: 1,
						allDay: appt.allDay ? '1' : '0',
						e: {
							tz: appt?.timezone,
							d: moment(moment(appt.end)).format('YYYYMMDDTHHmm00')
						},
						or: { a: appt.organizer?.address },
						s: {
							tz: appt?.timezone,
							d: moment(moment(appt.start)).format('YYYYMMDDTHHmm00')
						}
					}
				]
			},
			mp: {
				ct: 'multipart/alternative',
				mp: [
					{
						ct: 'text/html',
						content: `<html><body id='htmlmode3'>
							<table>
								<tr height="1.5rem"><td>New Time Proposed</td></tr>
								<tr height="1.5rem"><td>Subject: ${appt.title}</td></tr>
								<tr height="1.5rem" style="color:#2b73d2;font-weight:bold">
									<td>Time: ${moment(appt.start).format('dddd, D MMMM, YYYY, HH:mm:ss')} - ${moment(appt.end).format(
							'HH:mm:ss'
						)} GMT ${moment(appt.start)
							.tz(moment.tz.guess())
							.format('Z')} ${moment.tz.guess()} [MODIFIED]</td>
								</tr>
							</table>\n<div>*~*~*~*~*~*~*~*~*~*</div><br>
							${appt?.richText}
						`
					},
					{
						content: `New Time Proposed\n\nSubject: ${appt.title} \n\nTime: ${moment(
							appt.start
						).format('dddd, D MMMM, YYYY, HH:mm:ss')} - ${moment(appt.end).format('HH:mm:ss')} GMT
							${moment(appt.start)
								.tz(moment.tz.guess())
								.format('Z')} ${moment.tz.guess()} [MODIFIED]\n\n*~*~*~*~*~*~*~*~*~*\n\n${
							appt.plainText
						}`,
						ct: 'text/plain'
					}
				]
			},
			su: `New Time Proposed: ${appt.title}`
		}
	});
