/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { JSNS } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { batchRequest } from '../../soap/batch-request';
import { CreateMountpointRequest } from '../../types/soap/soap-actions';

export const createMountpoint = createAsyncThunk(
	'folders/get folder',
	async (links: any): Promise<any> => {
		const body: CreateMountpointRequest = {
			CreateMountpointRequest: map(links, (link) => ({
				link: {
					l: 1,
					name: `${link.name} ${link.of} ${link.ownerName}`,
					rid: link.folderId,
					view: 'appointment',
					zid: link.ownerId
				},
				_jsns: JSNS.mail
			})),
			_jsns: JSNS.all
		};
		return batchRequest(body);
	}
);
