/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { pickBy, identity } from 'lodash';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';

export const getInvite = createAsyncThunk(
	'invites/get invite',
	async ({ inviteId, ridZ }: { inviteId: string; ridZ?: string }): Promise<any> => {
		const { m } = (await soapFetch('GetMsg', {
			_jsns: 'urn:zimbraMail',
			m: pickBy(
				{
					html: 1,
					needExp: 1,
					id: inviteId,
					ridZ,
					header: [
						{
							n: 'List-ID'
						},
						{
							n: 'X-Zimbra-DL'
						},
						{
							n: 'IN-REPLY-TO'
						}
					],
					max: 250000
				},
				identity
			)
		})) as { m: any };
		return { m: m[0] };
	}
);
