/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse } from 'msw';

import { mockWorkingHoursResponse } from './mocks';
import {
	getNonWorkingHoursRequest,
	GetNonWorkingHoursRequest
} from '../get-non-working-hours-request';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

describe('getNonWorkingHoursRequest', () => {
	it('should call soapFetch with correct parameters', async () => {
		const request: GetNonWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: ['user1@example.com', 'user2@example.com']
		};

		const interceptor = mockWorkingHoursResponse([]);

		getNonWorkingHoursRequest(request);

		const soapRequest = await interceptor;
		expect(soapRequest).toMatchObject({
			_jsns: 'urn:zimbraMail',
			s: request.startEpochMillis,
			e: request.endEpochMillis,
			name: request.emails.join(',')
		});
	});

	it('should handle empty name array', async () => {
		const request: GetNonWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: []
		};

		const interceptor = mockWorkingHoursResponse([]);
		getNonWorkingHoursRequest(request);

		const soapRequest = await interceptor;
		expect(soapRequest).toMatchObject({
			name: ''
		});
	});

	it('should return the correct working hours', async () => {
		const request: GetNonWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: ['user1@example.com', 'user2@example.com']
		};

		const interceptor = mockWorkingHoursResponse([
			{ id: 'user1@example.com', u: [{ s: 123, e: 345 }], f: [] }
		]);

		const response = await getNonWorkingHoursRequest(request);

		await interceptor;
		expect(response).toEqual([
			{ email: 'user1@example.com', nonWorkingHours: [{ s: 123, e: 345 }] }
		]);
	});

	it('should throw exception when working hours API return 500', async () => {
		const request: GetNonWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: ['user1@example.com', 'user2@example.com']
		};

		createAPIInterceptor('post', '/service/soap/GetWorkingHoursRequest', HttpResponse.error());

		await expect(getNonWorkingHoursRequest(request)).rejects.toThrow();
	});

	it('should throw an exception when working hours API returns Soap Fault', async () => {
		const request: GetNonWorkingHoursRequest = {
			startEpochMillis: 1609459200,
			endEpochMillis: 1609545600,
			emails: ['user1@example.com', 'user2@example.com']
		};

		const interceptor = createSoapAPIInterceptor('GetWorkingHours', buildSoapErrorResponseBody());

		await expect(getNonWorkingHoursRequest(request)).rejects.toThrow();
		await interceptor;
	});
});
