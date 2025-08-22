/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { SearchReturnType } from './search-request';

export const NoOpRequest = async (): Promise<void> => {
	const response: SearchReturnType = await legacySoapFetch('NoOp', {
		_jsns: 'urn:zimbraMail'
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
