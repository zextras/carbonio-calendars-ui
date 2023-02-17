/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { sendInviteReplyRequest } from '../../soap/send-invite-reply-request';

export type SendInviteResponseArguments = {
	inviteId: string;
	action: string;
	updateOrganizer: boolean;
	fromMail?: boolean;
};

export const sendInviteResponse = createAsyncThunk(
	'invites/sendInviteResponse',
	async ({ inviteId, action, updateOrganizer }: SendInviteResponseArguments): Promise<any> => {
		const response = await sendInviteReplyRequest({ id: inviteId, action, updateOrganizer });
		return { response };
	}
);
