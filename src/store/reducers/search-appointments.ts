/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction } from '@reduxjs/toolkit';
import { values } from 'lodash';

import { normalizeAppointments } from '../../normalizations/normalize-appointments';
import { SearchReturnType } from '../../soap/search-request';
import { AppointmentsSlice, FulfilledResponse } from '../../types/store/store';
import { replaceAppointmentsToStore } from '../../utils/store/appointments';
import { SearchAppointmentsArguments } from '../actions/search-appointments';

export const searchAppointmentsPending = (state: AppointmentsSlice): void => {
	state.status = 'pending';
};

export const searchAppointmentsFulfilled = (
	state: AppointmentsSlice,
	{
		payload
	}: PayloadAction<SearchReturnType, string, FulfilledResponse<SearchAppointmentsArguments>>
): void => {
	const appt = normalizeAppointments(payload.appt);
	replaceAppointmentsToStore(state, values(appt));
	state.status = 'idle';
};

export const searchAppointmentsRejected = (state: AppointmentsSlice): void => {
	state.status = 'error';
};
