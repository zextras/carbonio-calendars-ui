/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppointmentsSlice } from '../../types/store/store';
import { addAppointmentsToStore } from '../../utils/store/appointments';

export const setAppointmentsInRangeReducer = (
	state: AppointmentsSlice,
	{ payload }: { payload: any }
): void => {
	addAppointmentsToStore(state, payload.appt);
};
