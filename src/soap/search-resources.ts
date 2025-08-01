/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { SearchReturnType } from './search-request';

export const searchResources = async (
	name: string,
	offset = 0,
	limit = 20
): Promise<SearchReturnType> => {
	const response: SearchReturnType = await legacySoapFetch('AutoCompleteGal', {
		name,
		limit,
		needExp: 1,
		offset,
		type: 'resource',
		_jsns: 'urn:zimbraAccount'
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
