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

export type MoveAppointmentArguments = {
	id: string;
	l: string;
};
export type MoveAppointmentReturnType = ItemActionReturnType;

export const moveAppointmentRequest = createAsyncThunk<
	MoveAppointmentReturnType,
	MoveAppointmentArguments,
	{
		rejectValue: ItemActionRejectedType;
	}
>('appointments/moveAppointment', async ({ id, l }, { rejectWithValue }) => {
	const response = await itemActionRequest({ id, op: 'move', parent: l });
	if (response?.error) {
		return rejectWithValue(response);
	}
	return response;
});
