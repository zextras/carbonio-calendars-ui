/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { filter, map, values } from 'lodash';

import { getMiniCalRequest } from '../../soap/get-mini-cal-request';
import { Calendar } from '../../types/store/calendars';

export const getMiniCal = createAsyncThunk(
	'calendars/getMiniCalRequest',
	async (
		{
			start,
			end
		}: {
			start: number;
			end: number;
		},
		{ getState }: any
	): Promise<unknown> => {
		const calendars = filter(
			values<Calendar>(getState()?.calendars?.calendars),
			(f) => f.checked && !f.broken
		);
		const folder = map(calendars, (c) => ({ id: c.id }));
		return getMiniCalRequest({ start, end, folder });
	}
);
