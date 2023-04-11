/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import moment from 'moment';
import { AppointmentsSlice, PendingResponse, RejectedResponse } from '../../types/store/store';
import {
	ModifyAppointmentArguments,
	ModifyAppointmentRejectedType
} from '../actions/modify-appointment';

export const handleModifyAppointmentPending = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<unknown, string, PendingResponse<ModifyAppointmentArguments>>
): void => {
	// eslint-disable-next-line no-param-reassign
	meta.arg.previousState = state.appointments;
	state.appointments[meta?.arg?.appt?.resource?.id].inst[0].s = Number(
		moment(meta.arg.mailInvite[0].comp[0].s[0].u).format('x')
	);
	state.appointments[meta?.arg?.appt?.resource?.id].dur = moment(
		meta.arg.mailInvite[0].comp[0].e[0].u
	).diff(moment(meta.arg.mailInvite[0].comp[0].s[0].u));
	state.status = 'pending';
};

export const handleModifyAppointmentFulfilled = (state: AppointmentsSlice): void => {
	state.status = 'fulfilled';
};

export const handleModifyAppointmentRejected = (
	state: AppointmentsSlice,
	{
		meta
	}: PayloadAction<
		ModifyAppointmentRejectedType | undefined,
		string,
		RejectedResponse<ModifyAppointmentArguments>,
		SerializedError
	>
): void => {
	state.status = 'failed';
	if (meta.arg.previousState) {
		state.appointments = meta.arg.previousState;
	}
};
