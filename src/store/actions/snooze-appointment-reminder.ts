/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { snoozeCalendarItemAlarmRequest } from '../../soap/snooze-calendar-item-alarm-request';

export const snoozeApptReminder = createAsyncThunk(
	'reminder/snoozeApptReminder',
	async ({ id, until }: { id: string; until: number }) => {
		const response = await snoozeCalendarItemAlarmRequest({ id, until });
		return { response };
	}
);
