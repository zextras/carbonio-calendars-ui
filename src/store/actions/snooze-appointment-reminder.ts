/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const snoozeApptReminder = createAsyncThunk(
	'reminder/snoozeApptReminder',
	async ({ id, until, t }: any) => {
		const response = await soapFetch('SnoozeCalendarItemAlarm', {
			_jsns: 'urn:zimbraMail',
			appt: [{ id, until }]
		});
		return { response };
	}
);
