/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { mapGenericError, mapSoapFault } from './error-codes';
import { ApiError } from './types';
import { CreateFolderRequest, CreateFolderResponse, RequestFolder } from 'types/soap/createFolder';

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
				return mapSoapFault(response);
			}
			return response;
		})
		.catch((error) => mapGenericError('Failure while executing API'));
