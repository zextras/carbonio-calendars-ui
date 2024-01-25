/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { counterAppointmentRequest } from '../../soap/counter-appointment-request';

export const proposeNewTime = createAsyncThunk(
	'calendars/proposeNewTime',
	async ({ id }: { id: string }, { getState, rejectWithValue }): Promise<any> => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const appt = getState()?.editor?.editors?.[id];
		const res = await counterAppointmentRequest({ appt });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const response = res?.Fault ? { ...res.Fault, error: true } : res;
		if (response?.error) {
			return rejectWithValue(response);
		}
		return { response: res, editor: appt };
	}
);
