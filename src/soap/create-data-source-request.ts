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
	CreateCalDavDataSourceResponse
} from 'types/soap/createDataSource';

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
		.then((response) => {
			if ('Fault' in response) {
				throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
			}
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});

