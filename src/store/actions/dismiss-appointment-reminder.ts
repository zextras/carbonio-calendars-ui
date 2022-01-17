/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const dismissApptReminder = createAsyncThunk(
	'reminder/dismisApptReminder',
	async ({ dismissItems }: any) => {
		const response = await soapFetch('DismissCalendarItemAlarm', {
			_jsns: 'urn:zimbraMail',
			appt: dismissItems
		});
		return { response };
	}
);
