/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { formatInTimeZone } from 'date-fns-tz';

import { HTML_OPENING_TAG } from '../constants';
import { generateParticipantInformation } from '../normalizations/normalize-soap-message-from-editor';
import { Editor } from '../types/editor';

export type CounterAppointmentRejectedType = {
	error: boolean;
	Fault: any;
	jsns?: never;
};
export type CounterAppointmentFulfilledType = {
	jsns?: string;
	Fault?: never;
	error?: never;
};
export type CounterAppointmentReturnType =
	| CounterAppointmentFulfilledType
	| CounterAppointmentRejectedType;

export const counterAppointmentRequest = async ({
	appt
}: {
	appt: Editor;
}): Promise<CounterAppointmentReturnType> => {
	const res: CounterAppointmentReturnType = await legacySoapFetch('CounterAppointment', {
		_jsns: 'urn:zimbraMail',
		comp: appt.compNum ?? 0,
		id: appt.inviteId?.includes('-') ? appt.inviteId : undefined,
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
							d: formatInTimeZone(
								new Date(appt.end ?? 0),
								appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
								"yyyyMMdd'T'HHmm'00'"
							)
						},
						exceptId: appt.exceptId,
						or: { a: appt.organizer?.email },
						s: {
							tz: appt?.timezone,
							d: formatInTimeZone(
								new Date(appt.start ?? 0),
								appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
								"yyyyMMdd'T'HHmm'00'"
							)
						}
					}
				]
			},
			mp: {
				ct: 'multipart/alternative',
				mp: [
					{
						ct: 'text/html',
						content: `${HTML_OPENING_TAG}
							<table>
								<tr height="1.5rem"><td>New Time Proposed</td></tr>
								<tr height="1.5rem"><td>Subject: ${appt.title}</td></tr>
								<tr height="1.5rem" style="color:#2b73d2;font-weight:bold">
									<td>Time: ${formatInTimeZone(new Date(appt.start ?? 0), appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, 'EEEE, d MMMM, yyyy, HH:mm:ss')} - ${formatInTimeZone(new Date(appt.end ?? 0), appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, 'HH:mm:ss')} GMT ${formatInTimeZone(new Date(appt.start ?? 0), appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, 'xxx')} ${appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone} [MODIFIED]</td>
								</tr>
							</table>\n<div>*~*~*~*~*~*~*~*~*~*</div><br>
							${appt?.richText}
						`
					},
					{
						content: `New Time Proposed\n\nSubject: ${appt.title} \n\nTime: ${formatInTimeZone(new Date(appt.start ?? 0), appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, 'EEEE, d MMMM, yyyy, HH:mm:ss')} - ${formatInTimeZone(new Date(appt.end ?? 0), appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, 'HH:mm:ss')} GMT ${formatInTimeZone(new Date(appt.start ?? 0), appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, 'xxx')} ${appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone} [MODIFIED]\n\n*~*~*~*~*~*~*~*~*~*\n\n${appt.plainText}`,
						ct: 'text/plain'
					}
				]
			},
			su: `New Time Proposed: ${appt.title}`
		}
	});
	return res?.Fault ? { ...res.Fault, error: true } : res;
};
