/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';

export const moveAppointmentRequest = createAsyncThunk(
	'appointments/moveAppointment',
	async ({ id, l, inviteId }: any): Promise<{ response: any; inviteId: string }> => {
		const response = await soapFetch('ItemAction', {
			_jsns: 'urn:zimbraMail',

			action: {
				op: 'move',
				l,
				id
			}
		});
		return { response, inviteId };
	}
);
