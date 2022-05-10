/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { reduce, find, uniqBy, forEach, cloneDeep } from 'lodash';
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

export const addAppointmentsToStore = (
	state: AppointmentsSlice,
	appts: Array<Appointment>
): void => {
	state.appointments = reduce(
		appts,
		(acc, appt) => {
			const key = find(acc, (item) => item.id === appt.id);
			return key
				? {
						...acc,
						[appt.id]: { ...appt, inst: uniqBy([...appt.inst, ...key.inst], 'ridZ') }
				  }
				: { ...acc, [appt.id]: appt };
		},
		state.appointments
	);
};
