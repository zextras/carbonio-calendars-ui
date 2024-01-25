/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
	DismissCalendarItemAlarmRejectedType,
	dismissCalendarItemAlarmRequest,
	DismissCalendarItemAlarmReturnType,
	DismissItem
} from '../../soap/dismiss-calendar-item-alarm-request';
import { AppointmentsSlice } from '../../types/store/store';

export type DismissApptReminderArguments = {
	dismissItems: DismissItem;
	previousState?: AppointmentsSlice['appointments'];
};

export const dismissApptReminder = createAsyncThunk<
	DismissCalendarItemAlarmReturnType,
	DismissApptReminderArguments,
	{
		rejectValue: DismissCalendarItemAlarmRejectedType;
	}
>(
	'calendar/dismissAppointmentReminder',
	async ({ dismissItems }: DismissApptReminderArguments, { rejectWithValue }) => {
		const response = await dismissCalendarItemAlarmRequest({ items: dismissItems });
		if (response?.error) {
			return rejectWithValue(response);
		}
		return response;
	}
);
