/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import { AppointmentsSlice } from '../../types/store/store';
import { moveAppointmentRequest } from '../actions/move-appointment';
import { moveAppointmentToTrash } from '../actions/move-appointment-to-trash';
import { modifyAppointmentRequest } from '../actions/modify-appointment';
import { searchAppointments } from '../actions/search-appointments';
import { deleteAppointmentPermanent } from '../actions/delete-appointment-permanent';
import { dismissApptReminder } from '../actions/dismiss-appointment-reminder';
import { snoozeApptReminder } from '../actions/snooze-appointment-reminder';
import { handleCreatedAppointmentsReducer } from '../reducers/handle-created-appointments';
import { handleModifiedAppointmentsReducer } from '../reducers/handle-modified-appointments';
import {
	moveAppointmentFulfilled,
	moveAppointmentPending,
	moveAppointmentRejected
} from '../reducers/move-appointment';
import {
	moveAppointmentToTrashFulfilled,
	moveAppointmentToTrashPending,
	moveAppointmentToTrashRejected
} from '../reducers/move-appointment-to-trash';
import {
	searchAppointmentsFulfilled,
	searchAppointmentsPending,
	searchAppointmentsRejected
} from '../reducers/search-appointments';
import { updateAppointmentReducer } from '../reducers/update-appointment';
import { handleUpdateParticipationStatus } from '../reducers/update-participation-status';
import {
	deleteAppointmentPermanentlyFulfilled,
	deleteAppointmentPermanentlyPending,
	deleteAppointmentPermanentlyRejected
} from '../reducers/delete-appointment-permanently';
import {
	dismissAppointmentFulfilled,
	dismissAppointmentPending,
	dismissAppointmentRejected
} from '../reducers/dismiss-appointment';
import {
	snoozeApptReminderFulfilled,
	snoozeApptReminderPending,
	snoozeApptReminderRejected
} from '../reducers/snooze-appointment';
import {
	handleModifyAppointmentPending,
	handleModifyAppointmentFulfilled,
	handleModifyAppointmentRejected
} from '../reducers/modify-appointment';

const initialState: AppointmentsSlice = {
	status: 'init',
	appointments: {}
};

export const appointmentsSlice = createSlice({
	name: 'appointments',
	initialState,
	reducers: {
		updateParticipationStatus: handleUpdateParticipationStatus,
		updateAppointment: updateAppointmentReducer,
		handleModifiedAppointments: handleModifiedAppointmentsReducer,
		handleCreatedAppointments: handleCreatedAppointmentsReducer
	},
	extraReducers: (builder) => {
		builder.addCase(modifyAppointmentRequest.pending, handleModifyAppointmentPending);
		builder.addCase(modifyAppointmentRequest.fulfilled, handleModifyAppointmentFulfilled);
		builder.addCase(modifyAppointmentRequest.rejected, handleModifyAppointmentRejected);
		builder.addCase(moveAppointmentToTrash.pending, moveAppointmentToTrashPending);
		builder.addCase(moveAppointmentToTrash.rejected, moveAppointmentToTrashRejected);
		builder.addCase(moveAppointmentToTrash.fulfilled, moveAppointmentToTrashFulfilled);
		builder.addCase(moveAppointmentRequest.fulfilled, moveAppointmentFulfilled);
		builder.addCase(moveAppointmentRequest.pending, moveAppointmentPending);
		builder.addCase(moveAppointmentRequest.rejected, moveAppointmentRejected);
		builder.addCase(deleteAppointmentPermanent.pending, deleteAppointmentPermanentlyPending);
		builder.addCase(deleteAppointmentPermanent.fulfilled, deleteAppointmentPermanentlyFulfilled);
		builder.addCase(deleteAppointmentPermanent.rejected, deleteAppointmentPermanentlyRejected);
		builder.addCase(dismissApptReminder.pending, dismissAppointmentPending);
		builder.addCase(dismissApptReminder.fulfilled, dismissAppointmentFulfilled);
		builder.addCase(dismissApptReminder.rejected, dismissAppointmentRejected);
		builder.addCase(snoozeApptReminder.pending, snoozeApptReminderPending);
		builder.addCase(snoozeApptReminder.fulfilled, snoozeApptReminderFulfilled);
		builder.addCase(snoozeApptReminder.rejected, snoozeApptReminderRejected);
		builder.addCase(searchAppointments.pending, searchAppointmentsPending);
		builder.addCase(searchAppointments.fulfilled, searchAppointmentsFulfilled);
		builder.addCase(searchAppointments.rejected, searchAppointmentsRejected);
	}
});

export const { updateAppointment, handleModifiedAppointments, updateParticipationStatus } =
	appointmentsSlice.actions;

export default appointmentsSlice.reducer;
