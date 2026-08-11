/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
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
	const tz = appt.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
	const startDate = new Date(appt.start ?? 0);
	const endDate = new Date(appt.end ?? 0);
	const formatICS = (date: Date): string => formatInTimeZone(date, tz, "yyyyMMdd'T'HHmm'00'");
	const newTimeProposed = t('label.new_time_proposed', 'New Time Proposed');
	const subjectLabel = t('label.subject', 'Subject');
	const timeLabel = t('label.time', 'Time');
	const modifiedLabel = t('label.modified', 'MODIFIED');
	const timeRange = `${formatInTimeZone(startDate, tz, 'EEEE, d MMMM, yyyy, HH:mm:ss')} - ${formatInTimeZone(endDate, tz, 'HH:mm:ss')} GMT ${formatInTimeZone(startDate, tz, 'xxx')} ${tz} [${modifiedLabel}]`;

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
							tz,
							d: formatICS(endDate)
						},
						exceptId: appt.exceptId,
						or: { a: appt.organizer?.email },
						s: {
							tz,
							d: formatICS(startDate)
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
								<tr height="1.5rem"><td>${newTimeProposed}</td></tr>
								<tr height="1.5rem"><td>${subjectLabel}: ${appt.title}</td></tr>
								<tr height="1.5rem" style="color:#2b73d2;font-weight:bold">
									<td>${timeLabel}: ${timeRange}</td>
								</tr>
							</table>\n<div>*~*~*~*~*~*~*~*~*~*</div><br>
							${appt?.richText}
						`
					},
					{
						content: `${newTimeProposed}\n\n${subjectLabel}: ${appt.title} \n\n${timeLabel}: ${timeRange}\n\n*~*~*~*~*~*~*~*~*~*\n\n${appt.plainText}`,
						ct: 'text/plain'
					}
				]
			},
			su: `${newTimeProposed}: ${appt.title}`
		}
	});
	return res?.Fault ? { ...res.Fault, error: true } : res;
};
