/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PayloadAction } from '@reduxjs/toolkit';
import { FulfilledResponse, InvitesSlice, PendingResponse } from '../../types/store/store';
import { SendInviteResponseArguments } from '../actions/send-invite-response';

export const sendInviteResponsePending = (
	state: InvitesSlice,
	action: PayloadAction<undefined, string, PendingResponse<SendInviteResponseArguments>>
): void => {
	if (!action.meta.arg.fromMail) {
		state.status = 'pending';
	}
};

export const sendInviteResponseFulfilled = (
	state: InvitesSlice,
	action: PayloadAction<undefined, string, FulfilledResponse<SendInviteResponseArguments>>
): void => {
	if (!action.meta.arg.fromMail) {
		state.status = 'fulfilled';
	}
};

export const sendInviteResponseRejected = (state: InvitesSlice): void => {
	state.status = 'error';
};
