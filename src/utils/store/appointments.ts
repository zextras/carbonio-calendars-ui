/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach } from 'lodash';

import { Appointment } from '../../types/store/appointments';
import { AppointmentsSlice } from '../../types/store/store';

export const replaceAppointmentsToStore = (
	state: AppointmentsSlice,
	appts: Array<Appointment>
): void => {
	forEach(appts, (appt) => {
		if (appt.id) {
			state.appointments = { ...state.appointments, [appt.id]: appt };
		}
	});
};
