/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction } from '@reduxjs/toolkit';
import { ParticipationStatus } from '../../types/store/invite';
import { AppointmentsSlice } from '../../types/store/store';

export const handleUpdateParticipationStatus = (
	state: AppointmentsSlice,
	action: PayloadAction<{ status: ParticipationStatus; apptId: string }>
): void => {
	const { status, apptId } = action.payload;
	state.appointments[apptId] = {
		...state.appointments[apptId],
		ptst: status
	};
};
