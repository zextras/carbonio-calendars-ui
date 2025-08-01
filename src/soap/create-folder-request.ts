/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { CreateFolderRequest, CreateFolderResponse, RequestFolder } from 'types/soap/createFolder';

export const createFolderRequest = async (params: RequestFolder): Promise<CreateFolderResponse> =>
	legacySoapFetch<CreateFolderRequest, CreateFolderResponse | ErrorSoapBodyResponse>(
		'CreateFolder',
		{
			_jsns: JSNS.mail,
			folder: { ...params }
		}
	)
		.then((response) => {
			if ('Fault' in response) {
				throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
			}
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});
