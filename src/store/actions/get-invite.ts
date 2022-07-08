/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMessageRequest } from '../../soap/get-message-request';

export const getInvite = createAsyncThunk(
	'invites/get invite',
	async ({ inviteId, ridZ }: { inviteId: string; ridZ?: string }): Promise<any> => {
		const { m } = await getMessageRequest({ inviteId, ridZ });
		return { m: m[0] };
	}
);
