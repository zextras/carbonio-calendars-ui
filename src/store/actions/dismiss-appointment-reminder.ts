/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { dismissCalendarItemAlarmRequest } from '../../soap/dismiss-calendar-item-alarm-request';

export const dismissApptReminder = createAsyncThunk(
	'calendar/dismissAppointmentReminder',
	async ({ dismissItems }: any) => dismissCalendarItemAlarmRequest({ items: dismissItems })
);
