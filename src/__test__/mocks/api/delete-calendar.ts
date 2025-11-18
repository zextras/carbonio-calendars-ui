/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { BaseFolderActionRequest } from '../../../types/soap/soap-actions';
import { FolderActionResponseOk, mockFolderActionRequest } from '@test-utils/api/common-apis';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const deleteAction = 'DeleteCalendar';

export const mockMoveCalendarToTrashApiOk = mockFolderActionRequest;

export const mockUndoMoveCalendarToTrashApiOk = mockFolderActionRequest;

export const mockUndoDeletePermanentlyCalendarApiOk = mockFolderActionRequest;

export const mockDeletePermanentlyCalendarApiOk = (
	response = { _jsns: 'urn:zimbraMail' as const }
): Promise<BaseFolderActionRequest> =>
	createSoapAPIInterceptor<BaseFolderActionRequest, FolderActionResponseOk>(deleteAction, response);
