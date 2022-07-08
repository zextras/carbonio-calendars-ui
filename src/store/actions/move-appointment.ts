/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { itemActionRequest } from '../../soap/item-action-request';

export const moveAppointmentRequest = createAsyncThunk(
	'appointments/moveAppointment',
	async ({ id, l, inviteId }: any): Promise<{ response: any; inviteId: string }> => {
		const response = await itemActionRequest({ inviteId: id, op: 'move', parent: l });
		return { response, inviteId };
	}
);
