/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SearchReturnType } from './search-request';

export const NoOpRequest = async (): Promise<void> => {
	const response: SearchReturnType = await soapFetch('NoOp', {
		_jsns: 'urn:zimbraMail'
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
