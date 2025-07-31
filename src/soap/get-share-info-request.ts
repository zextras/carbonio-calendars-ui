/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { isEmpty } from 'lodash';

export const getShareInfoRequest = async (): Promise<any> => {
	const result = await legacySoapFetch('GetShareInfo', {
		_jsns: 'urn:zimbraAccount',
		includeSelf: 0
	});
	return Promise.resolve({ isFulfilled: !isEmpty(result), calendars: result?.share ?? [] });
};
