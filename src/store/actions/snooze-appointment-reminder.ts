/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
	SnoozeCalendarItemAlarmRejectedType,
	snoozeCalendarItemAlarmRequest,
	SnoozeCalendarItemAlarmReturnType
} from '../../soap/snooze-calendar-item-alarm-request';
import { AppointmentsSlice } from '../../types/store/store';

export type SnoozeApptReminderArguments = {
	id: string;
	until: number;
	previousState?: AppointmentsSlice['appointments'];
};
export const snoozeApptReminder = createAsyncThunk<
	SnoozeCalendarItemAlarmReturnType,
	SnoozeApptReminderArguments,
	{
		rejectValue: SnoozeCalendarItemAlarmRejectedType;
	}
>('reminder/snoozeApptReminder', async ({ id, until }, { rejectWithValue }) => {
	const response = await snoozeCalendarItemAlarmRequest({ id, until });
	if (response?.error) {
		return rejectWithValue(response);
	}
	return response;
});
