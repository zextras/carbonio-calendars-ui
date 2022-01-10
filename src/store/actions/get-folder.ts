/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';
import { pickBy, identity } from 'lodash';

export const getFolder = createAsyncThunk('folders/get folder', async (id): Promise<any> => {
	const { link, folder } = (await soapFetch('GetFolder', {
		_jsns: 'urn:zimbraMail',
		folder: {
			l: id
		}
	})) as { link: any; folder: any };
	return pickBy({ link: link?.[0], folder: folder?.[0] }, identity);
});
