/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { getImportStatusRequest } from 'soap/get-import-status-request';
import { generateApiErrorResponse } from 'test/generators/api';
import { GetImportStatusRequest, GetImportStatusResponse } from 'types/soap/getImportStatus';

describe('getImportStatusRequest', () => {
	it('sends GetImportStatus SOAP request and returns the response', async () => {
		const successResponse: GetImportStatusResponse = {
			_jsns: JSNS.mail,
			caldav: [{ id: 'ds-1', isRunning: false, success: true }]
		};
		const apiInterceptor = createSoapAPIInterceptor<
			GetImportStatusRequest,
			GetImportStatusResponse
		>('GetImportStatus', successResponse);

		const result = await getImportStatusRequest();
		const apiParams = await apiInterceptor;

		expect(apiParams).toEqual({ _jsns: JSNS.mail });
		expect(result).toEqual(successResponse);
	});

	it('returns response without caldav entries when none are present', async () => {
		const emptyResponse: GetImportStatusResponse = { _jsns: JSNS.mail };
		createSoapAPIInterceptor<GetImportStatusRequest, GetImportStatusResponse>(
			'GetImportStatus',
			emptyResponse
		);

		const result = await getImportStatusRequest();
		expect(result.caldav).toBeUndefined();
	});

	it('throws when GetImportStatus returns a Fault', async () => {
		const faultyResponse = generateApiErrorResponse();
		createSoapAPIInterceptor<GetImportStatusRequest, ErrorSoapBodyResponse>(
			'GetImportStatus',
			faultyResponse
		);

		await expect(getImportStatusRequest()).rejects.toThrow(faultyResponse.Fault.Reason.Text);
	});
});
