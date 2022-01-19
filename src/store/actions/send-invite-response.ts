/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const sendInviteResponse = createAsyncThunk(
	'invites/sendInviteResponse',
	async ({ inviteId, action, updateOrganizer }: any): Promise<any> => {
		const response = await soapFetch('SendInviteReply', {
			_jsns: 'urn:zimbraMail',
			id: inviteId,
			compNum: 0,
			verb: action,
			rt: 'r',
			updateOrganizer
		});
		return { response };
	}
);
