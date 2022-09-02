/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, values, reduce, filter } from 'lodash';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { Appointment, InstanceReference } from '../../types/store/appointments';
import { Calendar } from '../../types/store/calendars';
import { Store } from '../../types/store/store';

export function selectAllAppointments({ appointments }: Store): Record<string, Appointment> {
	return appointments?.appointments;
}

export function selectAppointmentsArray({ appointments }: Store): Array<Appointment> {
	return values(appointments?.appointments);
}

export const selectAppointment =
	(id: string | undefined): (({ appointments }: Store) => Appointment | undefined) =>
	({ appointments }: Store): Appointment | undefined =>
		id ? appointments?.appointments?.[id] : undefined;

export const selectAppointmentInstance =
	(
		apptId: string | undefined,
		ridZ: string | undefined
	): (({ appointments }: Store) => InstanceReference | undefined) =>
	({ appointments }: Store): InstanceReference | undefined =>
		apptId && ridZ ? find(appointments?.appointments?.[apptId]?.inst, ['ridZ', ridZ]) : undefined;

export function selectApptStatus({ appointments }: Store): string {
	return appointments?.status;
}

export function getSelectedEvents(
	{ appointments }: Store,
	idMap: Record<string, Array<string>>,
	calendars: Record<string, Calendar>
): Array<any> {
	return normalizeCalendarEvents(
		values(
			reduce(
				idMap,
				(acc, v, k) => {
					const res = filter(
						appointments?.appointments[k]?.inst,
						(i) => !!find(v, (obj) => obj === i.ridZ)
					);
					return [...acc, { ...appointments?.appointments[k], inst: res }];
				},
				[] as Array<Appointment>
			)
		),
		calendars
	);
}
