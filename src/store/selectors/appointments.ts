/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSelector } from '@reduxjs/toolkit';
import { find, values, reduce, filter } from 'lodash';

import { Folder, Folders } from '../../carbonio-ui-commons/types/folder';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { EventType } from '../../types/event';
import { Appointment, InstanceReference } from '../../types/store/appointments';
import { AppointmentsSlice } from '../../types/store/store';
import type { RootState } from '../redux';

const selectAppointmentsSlice = (state: RootState): AppointmentsSlice => state.appointments;

export const selectAppointments = createSelector(
	[selectAppointmentsSlice],
	(slice) => slice.appointments
);

export const selectAppointmentsArray = createSelector([selectAppointments], (collections) =>
	values(collections)
);

export const selectAppointment =
	(id: string | undefined): (({ appointments }: RootState) => Appointment | undefined) =>
	({ appointments }: RootState): Appointment | undefined =>
		id ? appointments?.appointments?.[id] : undefined;

export const selectAppointmentInstance =
	(
		apptId: string | undefined,
		ridZ: string | undefined
	): (({ appointments }: RootState) => InstanceReference | undefined) =>
	({ appointments }: RootState): InstanceReference | undefined =>
		apptId && ridZ ? find(appointments?.appointments?.[apptId]?.inst, ['ridZ', ridZ]) : undefined;

export function selectApptStatus({ appointments }: RootState): string {
	return appointments?.status;
}

export function getSelectedEvents(
	{ appointments }: RootState,
	idMap: Record<string, Array<string>>,
	calendars: Folders
): Array<EventType> {
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
