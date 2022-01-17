/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const deleteAppointmentPermanent = createAsyncThunk(
	'appointments/deleteAppointmentPermanent',
	async ({ inviteId }: any): Promise<{ response: any; inviteId: string }> => {
		const response = await soapFetch('ItemAction', {
			_jsns: 'urn:zimbraMail',

			action: {
				op: 'delete',
				id: inviteId
			}
		});
		return { response, inviteId };
	}
);
