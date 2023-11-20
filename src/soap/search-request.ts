/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { Cn, SearchRequestProps } from '../types/soap/soap-actions';

export type SearchRejectedType = {
	error: boolean;
	Fault: any;
	appt?: never;
	cn?: never;
	more?: never;
	offset?: never;
	sortBy?: never;
};
export type SearchFulfilledType = {
	cn?: Cn;
	appt?: any;
	Fault?: never;
	error?: never;
	more: boolean;
	offset: number;
	sortBy: string;
};
export type SearchReturnType = SearchFulfilledType | SearchRejectedType;

export const searchRequest = async ({
	start,
	end,
	offset,
	sortBy,
	content
}: SearchRequestProps): Promise<SearchReturnType> => {
	const response: SearchReturnType = await soapFetch('Search', {
		_jsns: 'urn:zimbraMail',
		limit: '500',
		calExpandInstEnd: end,
		calExpandInstStart: start,
		offset: offset ?? 0,
		sortBy: sortBy ?? 'none',
		types: 'appointment',
		query: {
			_content: content
		}
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
