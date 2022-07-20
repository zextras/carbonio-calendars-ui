/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isEmpty } from 'lodash';

export const getShareInfoRequest = async (): Promise<any> => {
	const result = await soapFetch('GetShareInfo', {
		_jsns: 'urn:zimbraAccount',
		includeSelf: 0
	});
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return Promise.resolve({ isFulfilled: !isEmpty(result), calendars: result?.share ?? [] });
};
