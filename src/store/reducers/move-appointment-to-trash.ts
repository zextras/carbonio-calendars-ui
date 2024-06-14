/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { filter } from 'lodash';

import {
	AppointmentsSlice,
	FulfilledResponse,
	InvitesSlice,
	PendingResponse,
	RejectedResponse
} from '../../types/store/store';
import {
	MoveAppointmentToTrashArguments,
	MoveAppointmentToTrashReturnType
} from '../actions/move-appointment-to-trash';

type ModifyAppointmentRejectedType = { error: boolean; m?: never; Fault: any };

export const moveAppointmentToTrashPending = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<undefined, string, PendingResponse<MoveAppointmentToTrashArguments>>
): void => {
	const { ridZ, deleteSingleInstance, id } = meta.arg;

	state.status = 'pending';
	if (state.appointments) {
		// eslint-disable-next-line no-param-reassign
		meta.arg.previousState = state.appointments;
		deleteSingleInstance
			? (state.appointments[id].inst = filter(
					state.appointments[id].inst,
					(inst) => inst.ridZ !== ridZ
				))
			: (state.appointments[id].l = '3');
	}
};

export const moveAppointmentToTrashFulfilled = (
	state: InvitesSlice | AppointmentsSlice,
	action: PayloadAction<
		MoveAppointmentToTrashReturnType,
		string,
		FulfilledResponse<MoveAppointmentToTrashArguments>
	>
): void => {
	state.status = 'fulFilled';
	const { inviteId, ridZ, deleteSingleInstance, isRecurrent, id } = action.meta.arg;
	if ((state as InvitesSlice).invites) {
		if (!deleteSingleInstance) delete (state as InvitesSlice)?.invites?.[inviteId];
	}

	if ((state as AppointmentsSlice).appointments && isRecurrent) {
		(state as AppointmentsSlice).appointments[id].inst = filter(
			(state as AppointmentsSlice).appointments[id].inst,
			(inst) => inst.ridZ !== ridZ
		);
	}
};

export const moveAppointmentToTrashRejected = (
	state: AppointmentsSlice,
	{
		meta
	}: PayloadAction<
		ModifyAppointmentRejectedType | undefined,
		string,
		RejectedResponse<MoveAppointmentToTrashArguments>,
		SerializedError
	>
): void => {
	if (meta?.arg?.previousState) {
		state.appointments = meta.arg.previousState;
		state.status = 'error';
	}
};
