/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { formatInTimeZone } from 'date-fns-tz';

import { DtTimeInfo } from './send-invite-reply-request';
import { HTML_OPENING_TAG } from '../constants';

export type CounterInviteComponent = {
	uid?: string;
	seq?: number;
	allDay?: boolean;
	s?: DtTimeInfo[];
	e?: DtTimeInfo[];
	exceptId?: DtTimeInfo[];
	or?: { a?: string };
};

export type DeclineCounterAppointmentRecipient = {
	address: string;
	fullName?: string;
};

export type DeclineCounterAppointmentRejectedType = {
	error: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Fault: any;
	jsns?: never;
};
export type DeclineCounterAppointmentFulfilledType = {
	jsns?: string;
	Fault?: never;
	error?: never;
};
export type DeclineCounterAppointmentReturnType =
	| DeclineCounterAppointmentFulfilledType
	| DeclineCounterAppointmentRejectedType;

export const declineCounterAppointmentRequest = async ({
	title,
	fragment,
	to,
	comp,
	start,
	end
}: {
	title: string;
	fragment?: string;
	to: DeclineCounterAppointmentRecipient[];
	comp: CounterInviteComponent;
	start: number;
	end: number;
}): Promise<DeclineCounterAppointmentReturnType> => {
	const tz = comp?.s?.[0]?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
	const proposalDeclined = t('label.proposal_declined', 'Proposal declined');
	const subjectLabel = t('label.subject', 'Subject');
	const timeLabel = t('label.time', 'Time');
	const timeRange = comp?.allDay
		? formatInTimeZone(start, tz, 'EEEE, d MMMM, yyyy')
		: `${formatInTimeZone(start, tz, 'EEEE, d MMMM, yyyy, HH:mm:ss')} - ${formatInTimeZone(end, tz, 'HH:mm:ss')} GMT ${formatInTimeZone(start, tz, 'xxx')} ${tz}`;

	const res: DeclineCounterAppointmentReturnType = await legacySoapFetch(
		'DeclineCounterAppointment',
		{
			_jsns: 'urn:zimbraMail',
			m: {
				e: to.map((recipient) => ({ a: recipient.address, p: recipient.fullName, t: 't' })),
				inv: {
					comp: [
						{
							method: 'DECLINECOUNTER',
							name: title,
							uid: comp?.uid,
							seq: comp?.seq ?? 0,
							allDay: comp?.allDay ? '1' : '0',
							s: comp?.s?.[0],
							e: comp?.e?.[0],
							exceptId: comp?.exceptId,
							or: { a: comp?.or?.a }
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
								<tr height="1.5rem"><td>${proposalDeclined}</td></tr>
								<tr height="1.5rem"><td>${subjectLabel}: ${title}</td></tr>
								<tr height="1.5rem" style="color:#2b73d2;font-weight:bold">
									<td>${timeLabel}: ${timeRange}</td>
								</tr>
							</table>\n<div>*~*~*~*~*~*~*~*~*~*</div><br>
							${fragment ?? ''}
						`
						},
						{
							ct: 'text/plain',
							content: `${proposalDeclined}\n\n${subjectLabel}: ${title} \n\n${timeLabel}: ${timeRange}\n\n*~*~*~*~*~*~*~*~*~*\n\n${fragment ?? ''}`
						}
					]
				},
				su: `${proposalDeclined}: ${title}`
			}
		}
	);
	return res?.Fault ? { ...res.Fault, error: true } : res;
};
