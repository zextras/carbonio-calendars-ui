/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { getMessageRequest } from '../../soap/get-message-request';

export const getInvite = createAsyncThunk(
	'invites/get invite',
	async (
		{ inviteId, ridZ }: { inviteId: string; ridZ?: string },
		{ rejectWithValue }
	): Promise<any> => {
		const response = await getMessageRequest({ inviteId, ridZ });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (response?.error) {
			return rejectWithValue(response);
		}
		return normalizeInvite(response.m?.[0]);
	}
);
