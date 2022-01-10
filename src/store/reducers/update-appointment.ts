/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppointmentsSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const updateAppointmentReducer = (state: AppointmentsSlice, { payload }: any): any => {
	if (payload.isNew) {
		state.appointments[payload.appt.id] = payload.appt;
	} else {
		state.appointments[payload.appt.id] = payload.appt;
	}
};
