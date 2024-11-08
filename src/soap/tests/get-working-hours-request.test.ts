/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import {
	getWorkingHoursRequest,
	GetWorkingHoursRequest,
	GetWorkingHoursSoapRequest,
	GetWorkingHoursSoapResponse
} from '../get-working-hours-request';

describe('getWorkingHoursRequest', () => {
	it('should call soapFetch with correct parameters', async () => {
		const request: GetWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: ['user1@example.com', 'user2@example.com']
		};

		const interceptor = createSoapAPIInterceptor<
			GetWorkingHoursSoapRequest,
			GetWorkingHoursSoapResponse
		>('GetWorkingHours', { usr: [] });
		getWorkingHoursRequest(request);

		const soapRequest = await interceptor;
		expect(soapRequest).toMatchObject({
			_jsns: 'urn:zimbraMail',
			s: request.startEpochMillis,
			e: request.endEpochMillis,
			name: request.emails.join(',')
		});
	});

	it('should handle empty name array', async () => {
		const request: GetWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: []
		};

		const interceptor = createSoapAPIInterceptor<
			GetWorkingHoursSoapRequest,
			GetWorkingHoursSoapResponse
		>('GetWorkingHours', { usr: [] });
		getWorkingHoursRequest(request);

		const soapRequest = await interceptor;
		expect(soapRequest).toMatchObject({
			name: ''
		});
	});

	it('should return the correct working hours', async () => {
		const request: GetWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: ['user1@example.com', 'user2@example.com']
		};

		const interceptor = createSoapAPIInterceptor<
			GetWorkingHoursSoapRequest,
			GetWorkingHoursSoapResponse
		>('GetWorkingHours', { usr: [{ id: 'user1@example.com', u: [{ s: 123, e: 345 }], f: [] }] });
		getWorkingHoursRequest(request);

		const response = await getWorkingHoursRequest(request);

		await interceptor;
		expect(response).toEqual([{ id: 'user1@example.com', workingHours: [{ s: 123, e: 345 }] }]);
	});
});
