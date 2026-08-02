/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { importAppointmentsRequest } from 'soap/import-appointments-request';
import { generateApiErrorResponse } from 'test/generators/api';
import {
	ImportAppointmentsRequest,
	ImportAppointmentsResponse
} from 'types/soap/importAppointments';

const response: ImportAppointmentsResponse = {
	appt: [{ n: 1, ids: '0001' }],
	_jsns: JSNS.mail
};

describe('importAppointmentsRequest', () => {
	it('should call the ImportAppointments API with the correct parameters', async () => {
		const apiCallInterceptor = createSoapAPIInterceptor<
			ImportAppointmentsRequest,
			ImportAppointmentsResponse
		>('ImportAppointments', response);

		await importAppointmentsRequest({ folderId: '10', mid: '123', part: '2' });
		const apiParams = await apiCallInterceptor;

		expect(apiParams).toEqual({
			_jsns: JSNS.mail,
			ct: 'text/calendar',
			l: '10',
			content: { mid: '123', part: '2' }
		});
	});

	it('should forward a custom content type when provided', async () => {
		const apiCallInterceptor = createSoapAPIInterceptor<
			ImportAppointmentsRequest,
			ImportAppointmentsResponse
		>('ImportAppointments', response);

		await importAppointmentsRequest({ folderId: '10', mid: '123', part: '2', ct: 'ics' });
		const apiParams = await apiCallInterceptor;

		expect(apiParams.ct).toBe('ics');
	});

	it('should raise an error if the API call fails', async () => {
		const faultyResponse = generateApiErrorResponse();
		createSoapAPIInterceptor<ImportAppointmentsRequest, ErrorSoapBodyResponse>(
			'ImportAppointments',
			faultyResponse
		);

		await expect(
			importAppointmentsRequest({ folderId: '10', mid: '123', part: '2' })
		).rejects.toThrow(faultyResponse.Fault.Reason.Text);
	});
});
