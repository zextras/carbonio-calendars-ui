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
								u: appt.end,
								d: moment(moment(appt.end).utc()).format('YYYYMMDDTHHmm00')
							},
							or: appt.resource.organizer,
							s: {
								...appt.resource.start,
								u: appt.start,
								d: moment(moment(appt.start).utc()).format('YYYYMMDDTHHmm00')
							}
						}
					]
				},
				mp: {
					ct: 'multipart/alternative',
					mp: [
						{
							content: `New Time Proposed\n\nSubject: ${appt.title} \n\nTime: ${moment(
								appt.start
							).format('dddd, D MMMM, YYYY, HH:mm:ss')} - ${moment(appt.end).format('HH:mm:ss')} GMT
							${moment(appt.start).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()} [MODIFIED]\n\n`,
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
