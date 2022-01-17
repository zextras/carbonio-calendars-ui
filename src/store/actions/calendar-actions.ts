/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';
import { omitBy, isNil, isArray, map } from 'lodash';

export const folderAction = createAsyncThunk(
	'calendars/folderAction',
	async ({
		id,
		op,
		zid,
		changes
	}: {
		id: string;
		zid: string;
		op: string;
		changes?: any;
	}): Promise<any> => {
		let result;
		if (isArray(id)) {
			result = await soapFetch('Batch', {
				FolderActionRequest: map(id, (i, idx) => ({
					action: { op, id: i },
					requestId: idx,
					_jsns: 'urn:zimbraMail'
				})),
				_jsns: 'urn:zimbra',
				onerror: 'continue'
			});
		} else {
			result = await soapFetch('FolderAction', {
				_jsns: 'urn:zimbraMail',
				action: omitBy(
					{
						id,
						op,
						l: changes?.parent, // parent
						recursive: changes?.recursive,
						name: changes?.name,
						color: changes?.color,
						f: `${changes?.excludeFreeBusy ? 'b' : ''}${changes?.checked ? '#' : ''}`,
						zid
					},
					isNil
				)
			});
		}
		return result;
	}
);
