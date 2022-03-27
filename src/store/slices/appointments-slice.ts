/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import produce from 'immer';
import { moveAppointmentRequest } from '../actions/move-appointment';
import { moveAppointmentToTrash } from '../actions/move-appointment-to-trash';
// eslint-disable-next-line import/no-cycle
import { modifyAppointmentRequest } from '../actions/modify-appointment';
import { searchAppointments } from '../actions/search-appointments';
import { setSearchRange } from '../actions/set-search-range';
import { deleteAppointmentPermanent } from '../actions/delete-appointment-permanent';
import { dismissApptReminder } from '../actions/dismiss-appointment-reminder';
import { snoozeApptReminder } from '../actions/snooze-appointment-reminder';
import { handleCreatedAppointmentsReducer } from '../reducers/handle-created-appointments';
import { handleModifiedAppointmentsReducer } from '../reducers/handle-modified-appointments';
import { handleMetadataReducer } from '../reducers/handle-modified-invites';
import { handleSyncReducer } from '../reducers/handle-sync';
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
import { searchAppointmentsFulfilled } from '../reducers/search-appointments';
import { setRangeFulfilled, setRangePending, setRangeRejected } from '../reducers/set-search-range';
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

export const appointmentsSlice = createSlice({
	name: 'appointments',
	initialState: {
		status: 'init',
		appointments: {}
	},
	reducers: {
		updateParticipationStatus: handleUpdateParticipationStatus,
		updateAppointment: updateAppointmentReducer,
		handleModifiedAppointments: produce(handleModifiedAppointmentsReducer),
		handleCreatedAppointments: produce(handleCreatedAppointmentsReducer),
		handleModifiedApptMetadata: produce(handleMetadataReducer),
		handleAppointmentsSync: handleSyncReducer
	},
	extraReducers: (builder) => {
		builder.addCase(modifyAppointmentRequest.pending, handleModifyAppointmentPending);
		builder.addCase(modifyAppointmentRequest.fulfilled, handleModifyAppointmentFulfilled);
		builder.addCase(modifyAppointmentRequest.rejected, handleModifyAppointmentRejected);
		builder.addCase(setSearchRange.pending, setRangePending);
		builder.addCase(setSearchRange.fulfilled, setRangeFulfilled);
		builder.addCase(setSearchRange.rejected, setRangeRejected);
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
		builder.addCase(searchAppointments.fulfilled, searchAppointmentsFulfilled);
	}
});

export const {
	updateAppointment,
	handleModifiedAppointments,
	handleModifiedApptMetadata,
	updateParticipationStatus
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
