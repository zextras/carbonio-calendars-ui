/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getCalendarGroupsRequest = async (): Promise<any> =>
	soapFetch('GetCalendarGroups', {
		_jsns: 'urn:zimbraMail'
	});
