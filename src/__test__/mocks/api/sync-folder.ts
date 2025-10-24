/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpResponse } from 'msw';

import { FolderActionRequest, FolderActionResponseOk } from '../../../types/soap/soap-actions';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const apiAction = 'FolderAction';
export const mockSyncApiOk = (
	response = { _jsns: 'urn:zimbraMail' as const }
): Promise<FolderActionRequest> =>
	createSoapAPIInterceptor<FolderActionRequest, FolderActionResponseOk>(apiAction, response);

export const mockSyncApiError = (): Promise<FolderActionRequest> =>
	createSoapAPIInterceptor(apiAction, HttpResponse.error());
export const mockSyncApiInternalError = (): Promise<FolderActionRequest> =>
	createSoapAPIInterceptor(apiAction, HttpResponse.json({}, { status: 500 }));
export const mockSyncApiFault = (): Promise<FolderActionRequest> =>
	createSoapAPIInterceptor(apiAction, { Fault: {} });
