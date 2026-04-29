/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { ImportDataRequest, ImportDataResponse } from 'types/soap/importData';

export const importDataRequest = async (id: string): Promise<ImportDataResponse> =>
	legacySoapFetch<ImportDataRequest, ImportDataResponse | ErrorSoapBodyResponse>('ImportData', {
		_jsns: JSNS.mail,
		caldav: { id }
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
