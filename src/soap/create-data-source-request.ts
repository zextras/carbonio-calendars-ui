/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import {
	CalDavDataSourceParams,
	CreateCalDavDataSourceRequest,
	CreateCalDavDataSourceResponse,
	TestCalDavDataSourceParams,
	TestCalDavDataSourceRequest,
	TestCalDavDataSourceResponse
} from 'types/soap/createDataSource';

const throwOnSoapFault = <T extends object>(response: T | ErrorSoapBodyResponse): T => {
	if ('Fault' in response) {
		throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
	}
	return response;
};

export const createCalDavDataSourceRequest = async (
	params: CalDavDataSourceParams
): Promise<CreateCalDavDataSourceResponse> =>
	legacySoapFetch<
		CreateCalDavDataSourceRequest,
		CreateCalDavDataSourceResponse | ErrorSoapBodyResponse
	>('CreateDataSource', {
		_jsns: JSNS.mail,
		caldav: params
	})
		.then((response) => throwOnSoapFault(response))
		.catch((error) => {
			throw new Error(error);
		});

export const testCalDavDataSourceRequest = async (
	params: TestCalDavDataSourceParams
): Promise<TestCalDavDataSourceResponse> =>
	legacySoapFetch<
		TestCalDavDataSourceRequest,
		TestCalDavDataSourceResponse | ErrorSoapBodyResponse
	>('TestDataSource', {
		_jsns: JSNS.mail,
		caldav: params
	})
		.then((response) => throwOnSoapFault(response))
		.then((response) => {
			const caldavResult = response.caldav?.[0];
			if (caldavResult && !caldavResult.success) {
				throw new Error(caldavResult.error || 'Failed to validate CalDAV data source');
			}
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});
