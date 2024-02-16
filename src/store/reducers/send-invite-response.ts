/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PayloadAction } from '@reduxjs/toolkit';

import { SendInviteReplyReturnType } from '../../soap/send-invite-reply-request';
import { FulfilledResponse, InvitesSlice, PendingResponse } from '../../types/store/store';
import { SendInviteArguments } from '../actions/send-invite-response';

export const sendInviteResponsePending = (
	state: InvitesSlice,
	action: PayloadAction<undefined, string, PendingResponse<SendInviteArguments>>
): void => {
	if (!action.meta.arg.fromMail) {
		state.status = 'pending';
	}
};

export const sendInviteResponseFulfilled = (
	state: InvitesSlice,
	action: PayloadAction<SendInviteReplyReturnType, string, FulfilledResponse<SendInviteArguments>>
): void => {
	if (!action.meta.arg.fromMail) {
		state.status = 'fulfilled';
	}
	if (action.payload) {
		delete state.invites[action.meta.arg.inviteId];
	}
};

export const sendInviteResponseRejected = (state: InvitesSlice): void => {
	state.status = 'error';
};
