/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { omitBy, isNil } from 'lodash';
import { getFolderRequest } from '../../soap/get-folder-request';

export const getFolder = createAsyncThunk(
	'folders/get folder',
	async (id: string): Promise<any> => {
		const { link, folder } = await getFolderRequest({ id });
		return omitBy({ link: link?.[0], folder: folder?.[0] }, isNil);
	}
);
