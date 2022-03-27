/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import produce from 'immer';
import { getInvite } from '../actions/get-invite';
import { moveAppointmentToTrash } from '../actions/move-appointment-to-trash';
import { sendInviteResponse } from '../actions/send-invite-response';
import { getInviteFulfilled, getInviteRejected } from '../reducers/get-invite';
import {
	handleInviteMetadataReducer,
	handleModifiedInvitesReducer
} from '../reducers/handle-modified-invites';
import {
	moveAppointmentToTrashFulfilled,
	moveAppointmentToTrashPending,
	moveAppointmentToTrashRejected
} from '../reducers/move-appointment-to-trash';
import {
	sendInviteResponseFulfilled,
	sendInviteResponsePending,
	sendInviteResponseRejected
} from '../reducers/send-invite-response';

export const invitesSlice = createSlice({
	name: 'invites',
	initialState: {
		status: 'idle',
		invites: {}
	},
	reducers: {
		handleModifiedInvites: produce(handleModifiedInvitesReducer),
		handleInviteMetadata: produce(handleInviteMetadataReducer)
	},
	extraReducers: (builder) => {
		builder.addCase(getInvite.fulfilled, getInviteFulfilled);
		builder.addCase(getInvite.rejected, getInviteRejected);
		builder.addCase(sendInviteResponse.pending, sendInviteResponsePending);
		builder.addCase(sendInviteResponse.fulfilled, sendInviteResponseFulfilled);
		builder.addCase(sendInviteResponse.rejected, sendInviteResponseRejected);
		builder.addCase(moveAppointmentToTrash.pending, moveAppointmentToTrashPending);
		builder.addCase(moveAppointmentToTrash.rejected, moveAppointmentToTrashRejected);
		builder.addCase(moveAppointmentToTrash.fulfilled, moveAppointmentToTrashFulfilled);
	}
});

export const { handleModifiedInvites, handleInviteMetadata } = invitesSlice.actions;

export default invitesSlice.reducer;
