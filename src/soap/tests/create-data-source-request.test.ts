/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';
import * as soapLib from '@zextras/carbonio-ui-soap-lib';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import {
	createCalDavDataSourceRequest,
	testCalDavDataSourceRequest
} from 'soap/create-data-source-request';
import { generateApiErrorResponse } from 'test/generators/api';
import {
	CalDavDataSourceParams,
	CreateCalDavDataSourceRequest,
	CreateCalDavDataSourceResponse,
	TestCalDavDataSourceRequest,
	TestCalDavDataSourceResponse
} from 'types/soap/createDataSource';

const params: CalDavDataSourceParams = {
	name: 'My CalDAV Calendar',
	pollingInterval: '1m',
	isEnabled: '1',
	l: '42',
	host: 'mailbox1.demo.zextras.io',
	username: 'user@demo.zextras.io',
	password: 'secret',
	a: { n: 'zimbraDataSourceAttribute', _content: 'p:/principals/users/_USERNAME_/' }
};

const successResponse: CreateCalDavDataSourceResponse = {
	_jsns: JSNS.mail,
	caldav: [{ id: '100' }]
};

const testParams = {
	name: 'My CalDAV Calendar',
	host: 'mailbox1.demo.zextras.io',
	username: 'user@demo.zextras.io',
	password: 'secret',
	connectionType: 'ssl' as const,
	port: '443',
	a: { n: 'zimbraDataSourceAttribute', _content: 'p:/principals/users/_USERNAME_/' }
};

const testSuccessResponse: TestCalDavDataSourceResponse = {
	_jsns: JSNS.mail,
	caldav: [{ success: true }]
};

describe('data source API', () => {
	describe('createCalDavDataSourceRequest', () => {
		it('sends the correct CreateDataSource SOAP request', async () => {
			const apiInterceptor = createSoapAPIInterceptor<
				CreateCalDavDataSourceRequest,
				CreateCalDavDataSourceResponse
			>('CreateDataSource', successResponse);

			await createCalDavDataSourceRequest(params);
			const apiParams = await apiInterceptor;

			expect(apiParams).toEqual({
				_jsns: JSNS.mail,
				caldav: params
			});
		});

		it('omits username and password when no credentials are provided', async () => {
			const paramsWithoutCredentials: CalDavDataSourceParams = {
				name: 'No-Auth CalDAV',
				pollingInterval: '1m',
				isEnabled: '1',
				l: '99',
				host: 'public.caldav.example.com',
				a: { n: 'zimbraDataSourceAttribute', _content: 'p:/principals/users/_USERNAME_/' }
			};

			const apiInterceptor = createSoapAPIInterceptor<
				CreateCalDavDataSourceRequest,
				CreateCalDavDataSourceResponse
			>('CreateDataSource', successResponse);

			await createCalDavDataSourceRequest(paramsWithoutCredentials);
			const apiParams = await apiInterceptor;

			expect(apiParams.caldav).not.toHaveProperty('username');
			expect(apiParams.caldav).not.toHaveProperty('password');
			expect(apiParams.caldav.l).toBe('99');
		});

		it('throws when the API returns a Fault', async () => {
			const faultyResponse = generateApiErrorResponse();
			createSoapAPIInterceptor<CreateCalDavDataSourceRequest, ErrorSoapBodyResponse>(
				'CreateDataSource',
				faultyResponse
			);

			await expect(createCalDavDataSourceRequest(params)).rejects.toThrow(
				faultyResponse.Fault.Reason.Text
			);
		});

		it('normalizes string rejections into Error instances', async () => {
			vi.spyOn(soapLib, 'legacySoapFetch').mockRejectedValueOnce('string rejection');

			await expect(createCalDavDataSourceRequest(params)).rejects.toThrow('string rejection');
		});
	});

	describe('testCalDavDataSourceRequest', () => {
		it('sends the correct TestDataSource SOAP request', async () => {
			const apiInterceptor = createSoapAPIInterceptor<
				TestCalDavDataSourceRequest,
				TestCalDavDataSourceResponse
			>('TestDataSource', testSuccessResponse);

			await testCalDavDataSourceRequest(testParams);
			const apiParams = await apiInterceptor;

			expect(apiParams).toEqual({
				_jsns: JSNS.mail,
				caldav: testParams
			});
		});

		it('throws when TestDataSource returns a Fault', async () => {
			const faultyResponse = generateApiErrorResponse();
			createSoapAPIInterceptor<TestCalDavDataSourceRequest, ErrorSoapBodyResponse>(
				'TestDataSource',
				faultyResponse
			);

			await expect(testCalDavDataSourceRequest(testParams)).rejects.toThrow(
				faultyResponse.Fault.Reason.Text
			);
		});

		it('throws when caldav validation fails', async () => {
			const failResponse: TestCalDavDataSourceResponse = {
				_jsns: JSNS.mail,
				caldav: [{ success: false, error: 'Invalid credentials' }]
			};
			createSoapAPIInterceptor<TestCalDavDataSourceRequest, TestCalDavDataSourceResponse>(
				'TestDataSource',
				failResponse
			);

			await expect(testCalDavDataSourceRequest(testParams)).rejects.toThrow('Invalid credentials');
		});

		it('throws with generic message when caldav validation fails without error detail', async () => {
			const failResponse: TestCalDavDataSourceResponse = {
				_jsns: JSNS.mail,
				caldav: [{ success: false }]
			};
			createSoapAPIInterceptor<TestCalDavDataSourceRequest, TestCalDavDataSourceResponse>(
				'TestDataSource',
				failResponse
			);

			await expect(testCalDavDataSourceRequest(testParams)).rejects.toThrow(
				'Failed to validate CalDAV data source'
			);
		});

		it('normalizes object rejections with message into Error instances', async () => {
			vi.spyOn(soapLib, 'legacySoapFetch').mockRejectedValueOnce({
				message: 'object rejection message'
			});

			await expect(testCalDavDataSourceRequest(testParams)).rejects.toThrow(
				'object rejection message'
			);
		});
	});
});
