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

function mapFault(response: ErrorSoapBodyResponse): ApiError {
	const error = response.Fault.Reason.Text;
	const errorResponse: ApiError = { errors: {} };
	if (error === 'url must begin with http: or https:') {
		errorResponse.errors['create_folder.url.http_or_https'] = error;
	} else if (error === 'Document parse failed') {
		errorResponse.errors['create_folder.url.not_a_calendar'] = error;
	} else if (error.includes('resource unreachable')) {
		errorResponse.errors['create_folder.url.unreachable'] = error;
	} else {
		errorResponse.errors['api.generic_error'] = error;
	}
	return errorResponse;
}
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
				return mapFault(response);
			}
			return response;
		})
		.catch((error) => ({ errors: { 'api.generic_error': error.message } }));
