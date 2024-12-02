/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction } from '@reduxjs/toolkit';

import { AppointmentsSlice, FulfilledResponse } from '../../types/store/store';
import { DeleteAppointmentArguments } from '../actions/delete-appointment-permanent';

export const deleteAppointmentPermanentlyFulfilled = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<unknown, string, FulfilledResponse<DeleteAppointmentArguments>>
): void => {
	const { id } = meta.arg;
	delete state.appointments[id];
	state.status = 'completed';
};
