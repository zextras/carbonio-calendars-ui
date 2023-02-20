/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
	GetMessageRejectedType,
	getMessageRequest,
	GetMessageFulfilledType
} from '../../soap/get-message-request';

export type GetInviteArguments = { inviteId: string; ridZ?: string };

export const getInvite = createAsyncThunk<
	GetMessageFulfilledType,
	GetInviteArguments,
	{ rejectValue: GetMessageRejectedType }
>('invites/get invite', async ({ inviteId, ridZ }, { rejectWithValue }) => {
	const response = await getMessageRequest({ inviteId, ridZ });
	if ((response as GetMessageRejectedType)?.error) {
		return rejectWithValue(response as GetMessageRejectedType);
	}
	return response as GetMessageFulfilledType;
});
