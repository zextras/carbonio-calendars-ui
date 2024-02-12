/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
	ItemActionRejectedType,
	itemActionRequest,
	ItemActionReturnType
} from '../../soap/item-action-request';
import { AppointmentsSlice } from '../../types/store/store';

export type DeleteAppointmentArguments = {
	id: string;
	previousState?: AppointmentsSlice['appointments'];
};

export type DeleteAppointmentReturnType = {
	response: ItemActionReturnType;
	id: string;
};

export const deleteAppointmentPermanent = createAsyncThunk<
	DeleteAppointmentReturnType,
	DeleteAppointmentArguments,
	{
		rejectValue: ItemActionRejectedType;
	}
>('appointments/deleteAppointmentPermanent', async ({ id }, { rejectWithValue }) => {
	const response = await itemActionRequest({ id, op: 'delete' });
	if (response?.error) {
		return rejectWithValue(response);
	}
	return { response, id };
});
