/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getAppointmentAndInvite = createAsyncThunk(
	'batch/get-appt-and-invite',
	async ({ aptId, uid, inviteId }: { uid?: string; aptId: string; inviteId: string }) => {
		const result = (await soapFetch('Batch', {
			GetAppointmentRequest: {
				id: aptId,
				uid,
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
	}
);
