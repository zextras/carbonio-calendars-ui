/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
	GetMessageRejectedType,
	getMessageRequest,
	GetMessageReturnType
} from '../../soap/get-message-request';

export type GetInviteArguments = { inviteId: string; ridZ?: string };

export const getInvite = createAsyncThunk<
	GetMessageReturnType,
	GetInviteArguments,
	{ rejectValue: GetMessageRejectedType }
>('invites/get invite', async ({ inviteId, ridZ }, { rejectWithValue }) => {
	const response = await getMessageRequest({ inviteId, ridZ });
	if (response?.error) {
		return rejectWithValue(response);
	}
	return response;
});
