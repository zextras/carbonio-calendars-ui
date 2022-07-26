/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { itemActionRequest } from '../../soap/item-action-request';

export const deleteAppointmentPermanent = createAsyncThunk(
	'appointments/deleteAppointmentPermanent',
	async ({ inviteId }: { inviteId: string }): Promise<{ response: any; inviteId: string }> => {
		const response = await itemActionRequest({ inviteId, op: 'delete' });
		return { response, inviteId };
	}
);
