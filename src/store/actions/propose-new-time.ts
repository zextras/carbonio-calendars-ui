/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

export const proposeNewTime = createAsyncThunk(
	'calendars/proposeNewTime',
	async ({ id }: { id: string }, { getState }): Promise<any> => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const apptFromEditor = getState().editor.editors[id];
		const appt = apptFromEditor;
		const result = await soapFetch('CounterAppointment', {
			_jsns: 'urn:zimbraMail',
			comp: '0',
			id: appt.resource.inviteId,
			ms: appt.resource.ms,
			rev: appt.resource.rev,
			m: {
				e: [{ a: appt.resource.organizer.a, t: 't' }],
				inv: {
					comp: [
						{
							name: appt.title,
							uid: appt.resource.uid,
							seq: 1,
							allDay: appt.allDay ? '1' : '0',
							e: {
								...appt.resource.end,
								d: moment(moment(appt.end)).format('YYYYMMDDTHHmm00')
							},
							or: appt.resource.organizer,
							s: {
								...appt.resource.start,
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
								<tr height="24px"><td>New Time Proposed</td></tr>
								<tr height="24px"><td>Subject: ${appt.title}</td></tr>
								<tr height="24px" style="color:#2b73d2;font-weight:bold">
									<td>Time: ${moment(appt.start).format('dddd, D MMMM, YYYY, HH:mm:ss')} - ${moment(appt.end).format(
								'HH:mm:ss'
							)} GMT ${moment(appt.start)
								.tz(moment.tz.guess())
								.format('Z')} ${moment.tz.guess()} [MODIFIED]</td>
								</tr>
							</table>\n<div>*~*~*~*~*~*~*~*~*~*</div><br>
							${appt.resource?.richText}
						`
						},
						{
							content: `New Time Proposed\n\nSubject: ${appt.title} \n\nTime: ${moment(
								appt.start
							).format('dddd, D MMMM, YYYY, HH:mm:ss')} - ${moment(appt.end).format('HH:mm:ss')} GMT
							${moment(appt.start)
								.tz(moment.tz.guess())
								.format('Z')} ${moment.tz.guess()} [MODIFIED]\n\n*~*~*~*~*~*~*~*~*~*\n\n${
								appt.resource?.plainText
							}`,
							ct: 'text/plain'
						}
					]
				},
				su: `New Time Proposed: ${appt.title}`
			}
		});
		return result;
	}
);
