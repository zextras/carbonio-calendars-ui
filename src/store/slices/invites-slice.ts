/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';

import { InvitesSlice } from '../../types/store/store';
import { getInvite } from '../actions/get-invite';
import { moveAppointmentToTrash } from '../actions/move-appointment-to-trash';
import { modifyAppointment } from '../actions/new-modify-appointment';
import { proposeNewTime } from '../actions/propose-new-time';
import { sendInviteResponse } from '../actions/send-invite-response';
import { getInviteFulfilled, getInviteRejected } from '../reducers/get-invite';
import { handleModifiedInvitesReducer } from '../reducers/handle-modified-invites';
import { modifyAppointmentFullfilled } from '../reducers/modify-appointment-response';
import { moveAppointmentToTrashFulfilled } from '../reducers/move-appointment-to-trash';
import { proposeNewTimeFulfilled } from '../reducers/propose-new-time';
import {
	sendInviteResponseFulfilled,
	sendInviteResponsePending,
	sendInviteResponseRejected
} from '../reducers/send-invite-response';

const initialState: InvitesSlice = {
	status: 'idle',
	invites: {}
};

export const invitesSlice = createSlice({
	name: 'invites',
	initialState,
	reducers: {
		handleModifiedInvites: handleModifiedInvitesReducer
	},
	extraReducers: (builder) => {
		builder.addCase(getInvite.fulfilled, getInviteFulfilled);
		builder.addCase(getInvite.rejected, getInviteRejected);
		builder.addCase(sendInviteResponse.pending, sendInviteResponsePending);
		builder.addCase(sendInviteResponse.fulfilled, sendInviteResponseFulfilled);
		builder.addCase(sendInviteResponse.rejected, sendInviteResponseRejected);
		builder.addCase(moveAppointmentToTrash.fulfilled, moveAppointmentToTrashFulfilled);
		builder.addCase(modifyAppointment.fulfilled, modifyAppointmentFullfilled);
		builder.addCase(proposeNewTime.fulfilled, proposeNewTimeFulfilled);
	}
});

export const { handleModifiedInvites } = invitesSlice.actions;

export default invitesSlice.reducer;
