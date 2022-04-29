/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const itemAction = createAsyncThunk(
	'itemAction',
	async ({ inviteId, operation, tagName }: any): Promise<{ response: any; inviteId: string }> => {
		const response = await soapFetch('ItemAction', {
			_jsns: 'urn:zimbraMail',
			action: omitBy(
				{
					id: inviteId,
					op: operation,
					tn: tagName
				},
				isNil
			)
		});
		return { response, inviteId };
	}
);
