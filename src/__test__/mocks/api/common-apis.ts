/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';

import { BaseFolderActionRequest } from '../../../types/soap/soap-actions';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

export type FolderActionResponseOk = {
	_jsns: typeof JSNS.mail;
};
const folderAction = 'FolderAction';
export const mockFolderActionRequest = (
	response = { _jsns: 'urn:zimbraMail' as const }
): Promise<BaseFolderActionRequest> =>
	createSoapAPIInterceptor<BaseFolderActionRequest, FolderActionResponseOk>(folderAction, response);
