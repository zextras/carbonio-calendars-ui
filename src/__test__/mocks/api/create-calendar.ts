/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CreateFolderRequest } from '../../../types/soap/createFolder';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const apiAction = 'CreateFolder';

export const mockCreateCalendarInvalidURL = (): Promise<CreateFolderRequest> =>
	createSoapAPIInterceptor(apiAction, {
		Fault: { Reason: { Text: 'url must begin with http: or https:' } }
	});
