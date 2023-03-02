/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isArray, map } from 'lodash';
import { batchRequest } from '../../soap/batch-request';
import { folderActionRequest } from '../../soap/folder-action-request';
import { FolderActionRequest } from '../../types/soap/soap-actions';

export const folderAction = createAsyncThunk(
	'calendars/folderActionRequest',
	async ({
		id,
		op,
		zid,
		changes
	}: {
		id: Array<string> | string;
		zid?: string;
		op: string;
		changes?: any;
	}) => {
		if (isArray(id)) {
			const body: FolderActionRequest = {
				_jsns: 'urn:zimbra',
				onerror: 'continue',
				FolderActionRequest: map(id, (i, idx) => ({
					action: { op, id: i },
					requestId: idx,
					_jsns: 'urn:zimbraMail'
				}))
			};
			return batchRequest(body) as Promise<unknown>;
		}
		return folderActionRequest({
			id,
			op,
			zid,
			changes
		}) as Promise<unknown>;
	}
);
