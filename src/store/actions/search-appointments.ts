/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isNil, omitBy } from 'lodash';

import { SearchRejectedType, searchRequest, SearchReturnType } from '../../soap/search-request';
import { SearchRequestProps } from '../../types/soap/soap-actions';
import { AppointmentsSlice } from '../../types/store/store';
import type { RootState } from '../redux';

export type SearchAppointmentsArguments = {
	spanStart: number;
	spanEnd: number;
	query?: string;
	offset?: number;
	sortBy?: string;
	previousState?: AppointmentsSlice['appointments'];
};

export const searchAppointments = createAsyncThunk<
	SearchReturnType,
	SearchAppointmentsArguments,
	{
		state: RootState;
		rejectValue: SearchRejectedType;
	}
>(
	'calendars/search',
	async ({ spanStart, spanEnd, query, offset, sortBy }, { rejectWithValue }) => {
		const arg = omitBy(
			{ start: spanStart, end: spanEnd, content: query, sortBy, offset },
			isNil
		) as SearchRequestProps;
		const response = await searchRequest(arg);
		if (response?.error) {
			return rejectWithValue(response);
		}
		return response;
	}
);
