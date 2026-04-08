/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { createCalDavDataSourceRequest } from 'soap/create-data-source-request';
import { generateApiErrorResponse } from 'test/generators/api';
import {
	CalDavDataSourceParams,
	CreateCalDavDataSourceRequest,
	CreateCalDavDataSourceResponse
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
});
