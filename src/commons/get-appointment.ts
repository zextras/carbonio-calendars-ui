/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

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
