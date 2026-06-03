/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { importDataRequest } from 'soap/import-data-request';
import { generateApiErrorResponse } from 'test/generators/api';
import { ImportDataRequest, ImportDataResponse } from 'types/soap/importData';

describe('importDataRequest', () => {
	it('sends the correct ImportData SOAP request for caldav datasource', async () => {
		const successResponse: ImportDataResponse = { _jsns: JSNS.mail };
		const apiInterceptor = createSoapAPIInterceptor<ImportDataRequest, ImportDataResponse>(
			'ImportData',
			successResponse
		);

		await importDataRequest('ds-123');
		const apiParams = await apiInterceptor;

		expect(apiParams).toEqual({
			_jsns: JSNS.mail,
			caldav: { id: 'ds-123' }
		});
	});

	it('throws when ImportData returns a Fault', async () => {
		const faultyResponse = generateApiErrorResponse();
		createSoapAPIInterceptor<ImportDataRequest, ErrorSoapBodyResponse>(
			'ImportData',
			faultyResponse
		);

		await expect(importDataRequest('ds-123')).rejects.toThrow(faultyResponse.Fault.Reason.Text);
	});
});
