/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { GetImportStatusRequest, GetImportStatusResponse } from 'types/soap/getImportStatus';

export const getImportStatusRequest = async (): Promise<GetImportStatusResponse> =>
	legacySoapFetch<GetImportStatusRequest, GetImportStatusResponse | ErrorSoapBodyResponse>(
		'GetImportStatus',
		{ _jsns: JSNS.mail }
	)
		.then((response) => {
			if ('Fault' in response) {
				throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
			}
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});
