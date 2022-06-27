/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { reduce, find, forEach, isEqual, uniqWith } from 'lodash';
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
			const inst = key ? uniqWith([...appt.inst, ...key.inst], isEqual) : undefined;
			const res =
				key && inst
					? {
							...acc,
							[appt.id]: { ...appt, inst }
					  }
					: { ...acc, [appt.id]: appt };
			return res;
		},
		state.appointments
	);
};
