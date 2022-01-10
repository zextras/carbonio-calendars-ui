/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';
import { selectAllCheckedCalendarsQuery } from '../selectors/calendars';

export const searchAppointments = createAsyncThunk(
	'calendars/search',
	async (
		{
			spanStart,
			spanEnd,
			query,
			offset,
			sortBy
		}: {
			spanStart: number;
			spanEnd: number;
			query?: string;
			offset?: number;
			sortBy?: string;
		},
		{ getState }: any
	): Promise<unknown> => {
		const res = await soapFetch('Search', {
			_jsns: 'urn:zimbraMail',
			limit: '500',
			calExpandInstEnd: spanEnd,
			calExpandInstStart: spanStart,
			// locale: {
			//	_content: "it",
			// },
			offset: offset ?? 0,
			sortBy: sortBy ?? 'none',
			types: 'appointment',
			query: {
				_content: query ?? selectAllCheckedCalendarsQuery(getState())
			}
		});
		return res;
	}
);
