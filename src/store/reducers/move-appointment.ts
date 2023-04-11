/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { ItemActionRejectedType } from '../../soap/item-action-request';
import { AppointmentsSlice, PendingResponse, RejectedResponse } from '../../types/store/store';
import { MoveAppointmentArguments } from '../actions/move-appointment';

export const moveAppointmentPending = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<undefined, string, PendingResponse<MoveAppointmentArguments>>
): void => {
	if (!meta.arg.fromMail) {
		const { l, id } = meta.arg;
		// eslint-disable-next-line no-param-reassign
		meta.arg.previousState = state.appointments;
		state.appointments[id].l = l;
	}
};

export const moveAppointmentFulfilled = (state: AppointmentsSlice): void => {
	state.status = 'completed';
};

export const moveAppointmentRejected = (
	state: AppointmentsSlice,
	{
		meta
	}: PayloadAction<
		ItemActionRejectedType | undefined,
		string,
		RejectedResponse<MoveAppointmentArguments>,
		SerializedError
	>
): void => {
	if (!meta.arg.fromMail && meta.arg.previousState) {
		state.appointments = meta.arg.previousState;
	}
};
