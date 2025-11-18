/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CreateFolderRequest, CreateFolderResponse } from '../../../types/soap/createFolder';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const apiAction = 'CreateFolder';

export const mockCreateCalendarApiOk = (
	response: CreateFolderResponse
): Promise<CreateFolderRequest> =>
	createSoapAPIInterceptor<CreateFolderRequest, CreateFolderResponse>(apiAction, response);

export const mockCreateCalendarFault = (error: string): Promise<CreateFolderRequest> =>
	createSoapAPIInterceptor(apiAction, {
		Fault: { Reason: { Text: error } }
	});
