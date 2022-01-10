/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';
import { pickBy, identity } from 'lodash';

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
		const result = await soapFetch('FolderAction', {
			_jsns: 'urn:zimbraMail',
			action: pickBy(
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
				identity
			)
		});
		return result;
	}
);
