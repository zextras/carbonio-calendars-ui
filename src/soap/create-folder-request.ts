/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import {
	ApiError,
	CreateFolderRequest,
	CreateFolderResponse,
	RequestFolder
} from 'types/soap/createFolder';

export const createFolderRequest = async (
	params: RequestFolder
): Promise<CreateFolderResponse | ApiError> =>
	legacySoapFetch<CreateFolderRequest, CreateFolderResponse | ErrorSoapBodyResponse>(
		'CreateFolder',
		{
			_jsns: JSNS.mail,
			folder: { ...params }
		}
	)
		.then((response) => {
			if ('Fault' in response) {
				return { errors: { 'create_folder.invalid_url': response.Fault.Reason.Text } };
			}
			return response;
		})
		.catch((error) => ({ errors: { 'api.generic_error': error.message } }));
