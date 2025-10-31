/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BaseFolderActionRequest } from '../../../types/soap/soap-actions';
import { FolderActionResponseOk } from '@test-utils/api/delete-calendar';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const folderAction = 'FolderAction';
export const mockFolderActionRequest = (
	response = { _jsns: 'urn:zimbraMail' as const }
): Promise<BaseFolderActionRequest> =>
	createSoapAPIInterceptor<BaseFolderActionRequest, FolderActionResponseOk>(folderAction, response);
