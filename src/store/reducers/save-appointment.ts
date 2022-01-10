/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAlarmToString } from '../../normalizations/normalizations-utils';
import { normalizeAppointmentFromCreation } from '../../normalizations/normalize-appointments';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleSaveAppointmentPending = (state: any) => {
	state.status = 'syncing';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleSaveAppointmentFulfilled = (state: any, { meta, payload }: any) => {
	/* if (state.appointments) {
		state.status = 'succeeded';
		if (payload.isNew) {
			state.appointments[payload.resp.apptId] = normalizeAppointmentFromCreation(
				payload.resp.echo[0].m[0],
				payload.appt,
				payload.resp.apptId
			);
		}
		if (state.appointments[payload?.resp?.apptId] && payload?.body?.m?.l) {
			state.appointments[payload.resp.apptId] = {
				...state.appointments[payload.resp.apptId],
				l: payload?.body?.m?.l
			};
		}
	}
	if (
		state.invites &&
		payload?.resp?.echo?.[0]?.m?.[0]?.inv?.[0]?.comp?.[0]?.alarm &&
		state?.invites?.[payload?.appt?.resource?.inviteId]
	) {
		state.invites[payload.appt.resource.inviteId].alarmValue = `${payload.appt.resource.alarm}`;
		state.invites[payload.appt.resource.inviteId].alarmString = `${getAlarmToString(
			payload.resp.echo[0].m[0].inv[0].comp[0].alarm
		)}`;
	} */
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleSaveAppointmentRejected = (state: any): void => {
	state.status = 'failed';
	// state.error = action.error.message
};
