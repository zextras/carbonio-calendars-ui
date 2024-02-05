/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
	CounterAppointmentRejectedType,
	counterAppointmentRequest
} from '../../soap/counter-appointment-request';
import type { RootState } from '../redux';

// it is impossible to write down the proper type due to other missing types around the functions
export const proposeNewTime = createAsyncThunk<
	any,
	{ id: string },
	{
		state: RootState;
		rejectValue: CounterAppointmentRejectedType;
	}
>('calendars/proposeNewTime', async ({ id }, { getState, rejectWithValue }) => {
	const editor = getState()?.editor?.editors?.[id];
	const res = await counterAppointmentRequest({ appt: editor });

	if (res?.error) {
		return rejectWithValue(res);
	}
	return { response: res, editor };
});
