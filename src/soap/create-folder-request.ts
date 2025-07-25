/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { CreateFolderRequest, RequestFolder } from 'types/soap/createFolder';

export const createFolderRequest = async (params: RequestFolder): Promise<any> =>
	legacySoapFetch<CreateFolderRequest, any>('CreateFolder', {
		_jsns: JSNS.mail,
		folder: { ...params }
	})
		.then((response) => {
			if ('Fault' in response) {
				throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
			}
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});
