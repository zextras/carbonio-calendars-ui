/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
	SendInviteReplyRejectedType,
	sendInviteReplyRequest,
	SendInviteReplyReturnType
} from '../../soap/send-invite-reply-request';
import { InstanceExceptionId } from '../../utils/event';

export type SendInviteArguments = {
	inviteId: string;
	action: string;
	exceptId?: InstanceExceptionId | undefined;
	updateOrganizer: boolean;
	fromMail?: boolean;
};

export const sendInviteResponse = createAsyncThunk<
	SendInviteReplyReturnType,
	SendInviteArguments,
	{ rejectValue: SendInviteReplyRejectedType }
>(
	'invites/sendInviteResponse',
	async ({ inviteId, action, updateOrganizer, exceptId }, { rejectWithValue }) => {
		const response = await sendInviteReplyRequest({
			id: inviteId,
			action,
			updateOrganizer,
			exceptId
		});
		if (response?.error) {
			return rejectWithValue(response);
		}
		return response;
	}
);
