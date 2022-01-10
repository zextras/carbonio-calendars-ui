/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { normalizeAppointments } from '../../normalizations/normalize-appointments';
import { Appointment } from '../../types/store/appointments';
import { searchAppointments } from './search-appointments';

export const setSearchRange = createAsyncThunk(
	'calendars/search appointments',
	async (
		{
			rangeStart,
			rangeEnd
		}: {
			rangeStart: number;
			rangeEnd: number;
		},
		{ dispatch }: any
	): Promise<Array<Appointment> | undefined> => {
		const { payload: appts } = await dispatch(
			searchAppointments({ spanStart: rangeStart, spanEnd: rangeEnd })
		);
		return normalizeAppointments(appts.appt) as Array<Appointment> | undefined;
	}
);
