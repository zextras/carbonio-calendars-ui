/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

import { Appointment } from '../types/store/appointments';

export const getAppointmentAndInvite = async ({
	aptId,
	inviteId
}: {
	aptId: string;
	inviteId: string;
}): Promise<{ appointment: any; invite: any }> => {
	const result = (await soapFetch('Batch', {
		GetAppointmentRequest: {
			id: aptId,
			includeContent: '1',
			_jsns: 'urn:zimbraMail'
		},
		GetMsgRequest: {
			m: {
				html: 1,
				needExp: 1,
				id: inviteId,
				header: [
					{
						n: 'List-ID'
					},
					{
						n: 'X-Zimbra-DL'
					},
					{
						n: 'IN-REPLY-TO'
					},
					{ n: 'GoPolicyd-isExtNetwork' }
				],
				max: 250000
			},
			_jsns: 'urn:zimbraMail'
		},
		_jsns: 'urn:zimbra',
		onerror: 'continue'
	})) as Record<string, Array<any>>;
	return {
		appointment: result.GetAppointmentResponse[0].appt[0],
		invite: result.GetMsgResponse[0].m[0]
	};
};

// it is impossible to type right now or it will break too many parts of the app
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeFromGetAppointment = (appt: any): Appointment => <Appointment>omitBy(
		{
			id: appt?.apptId,
			l: appt.ciFolder,
			alarm: appt?.inv?.[0]?.comp?.[0]?.alarm,
			alarmData: appt?.inv?.[0]?.comp?.[0]?.alarmData,
			fb: appt?.inv?.[0]?.comp?.[0]?.fb,
			fr: appt?.inv?.[0]?.comp?.[0]?.fr,
			d: appt?.d,
			fba: appt?.inv?.[0]?.comp?.[0]?.fba,
			md: appt.md,
			flags: appt?.inv?.[0]?.comp?.[0]?.f,
			ms: appt?.inv?.[0]?.comp?.[0]?.ms,
			ptst: appt?.ptst,
			rev: appt.rev,
			status: appt?.inv?.[0]?.comp?.[0]?.status,
			transp: appt?.inv?.[0]?.comp?.[0]?.transp,
			uid: appt.uid,
			compNum: appt?.inv?.[0]?.compNum,
			class: appt?.inv?.[0]?.comp?.[0]?.class,
			dur:
				appt?.inv?.[0]?.comp?.[0]?.e?.[0]?.u && appt?.inv?.[0]?.comp?.[0]?.s?.[0]?.u
					? appt.inv[0].comp[0].e[0].u - appt.inv[0].comp[0].s[0].u
					: undefined,
			allDay: appt?.inv?.[0]?.comp?.[0]?.allDay ?? false,
			draft: appt?.inv?.[0]?.comp?.[0]?.draft,
			inviteId: appt?.id && appt?.inv?.[0] ? `${appt.id}-${appt.inv[0].id}` : undefined,
			isOrg: appt?.inv?.[0]?.comp?.[0]?.isOrg,
			loc: appt?.inv?.[0]?.comp?.[0]?.loc,
			otherAtt: appt?.inv?.[0]?.comp?.[0]?.otherAtt,
			recur: !!appt?.inv?.[0]?.comp?.[0]?.recur,
			name: appt?.inv?.[0]?.comp?.[0]?.name,
			meta: appt?.meta,
			neverSent: appt?.inv?.[0]?.comp?.[0]?.neverSent,
			or: appt?.inv?.[0]?.comp?.[0]?.or,
			s: appt.s
		},
		isNil
	);

export const getAppointment = async (id: string): Promise<any> =>
	soapFetch('GetAppointment', {
		id,
		includeContent: '1',
		_jsns: 'urn:zimbraMail'
	});
