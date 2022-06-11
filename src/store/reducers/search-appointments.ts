/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { values } from 'lodash';
import { normalizeAppointments } from '../../normalizations/normalize-appointments';
import { AppointmentsSlice } from '../../types/store/store';
import { addAppointmentsToStore } from '../../utils/store/appointments';

export const searchAppointmentsPending = (state: AppointmentsSlice): void => {
	state.status = 'pending';
};

export const searchAppointmentsFulfilled = (
	state: AppointmentsSlice,
	{ payload }: { payload: any }
): void => {
	const appt = normalizeAppointments(payload.appt);
	addAppointmentsToStore(state, values(appt));
	state.status = 'idle';
};

export const searchAppointmentsRejected = (state: AppointmentsSlice): void => {
	state.status = 'error';
};