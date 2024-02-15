/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction, SerializedError } from '@reduxjs/toolkit';

import { ItemActionRejectedType } from '../../soap/item-action-request';
import { AppointmentsSlice, PendingResponse, RejectedResponse } from '../../types/store/store';
import { DeleteAppointmentArguments } from '../actions/delete-appointment-permanent';

export const deleteAppointmentPermanentlyPending = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<unknown, string, PendingResponse<DeleteAppointmentArguments>>
): void => {
	const { id } = meta.arg;
	// eslint-disable-next-line no-param-reassign
	meta.arg.previousState = state.appointments;
	delete state.appointments[id];
};

export const deleteAppointmentPermanentlyFulfilled = (state: AppointmentsSlice): void => {
	state.status = 'completed';
};

export const deleteAppointmentPermanentlyRejected = (
	state: AppointmentsSlice,
	{
		meta
	}: PayloadAction<
		ItemActionRejectedType | undefined,
		string,
		RejectedResponse<DeleteAppointmentArguments>,
		SerializedError
	>
): void => {
	if (meta.arg.previousState) {
		state.appointments = meta.arg.previousState;
	}
};
