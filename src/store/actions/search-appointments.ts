/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isNil, omitBy } from 'lodash';
import { searchRequest } from '../../soap/search-request';
import { SearchRequestProps } from '../../types/soap/soap-actions';
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
		const _content = query ?? selectAllCheckedCalendarsQuery(getState());
		const arg = omitBy(
			{ start: spanStart, end: spanEnd, content: _content, sortBy, offset },
			isNil
		) as SearchRequestProps;
		return searchRequest(arg);
	}
);
