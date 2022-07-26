/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { SearchRequestProps } from '../types/soap/soap-actions';

export const searchRequest = async ({
	start,
	end,
	offset,
	sortBy,
	content
}: SearchRequestProps): Promise<any> =>
	soapFetch('Search', {
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
