/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FolderActionRequest, FolderActionResponseOk } from '../../../types/soap/soap-actions';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const apiAction = 'FolderAction';

export const mockMoveCalendarToTrashApiOk = (
	response = { _jsns: 'urn:zimbraMail' as const }
): Promise<FolderActionRequest> =>
	createSoapAPIInterceptor<FolderActionRequest, FolderActionResponseOk>(apiAction, response);
