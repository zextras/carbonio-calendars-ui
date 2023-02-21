/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
	itemActionRequest,
	ItemActionRejectedType,
	ItemActionReturnType
} from '../../soap/item-action-request';
import { AppointmentsSlice } from '../../types/store/store';

export type MoveAppointmentArguments = {
	id: string;
	l: string;
	inviteId: string;
	fromMail?: boolean;
	previousState?: AppointmentsSlice['appointments'];
};
export type MoveAppointmentReturnType = { response: ItemActionReturnType; inviteId: string };

export const moveAppointmentRequest = createAsyncThunk<
	MoveAppointmentReturnType,
	MoveAppointmentArguments,
	{
		rejectValue: ItemActionRejectedType;
	}
>('appointments/moveAppointment', async ({ id, l, inviteId }, { rejectWithValue }) => {
	const response = await itemActionRequest({ inviteId: id, op: 'move', parent: l });
	if (response?.error) {
		return rejectWithValue(response);
	}
	return { response, inviteId };
});
