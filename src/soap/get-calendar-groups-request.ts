/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export type GetCalendarGroupsResponse = {
	group: [
		{
			id: string;
			name: string;
			calendarId: { _content: string }[];
		}
	];
};

export const getCalendarGroupsRequest = async (): Promise<GetCalendarGroupsResponse> =>
	soapFetch('GetCalendarGroups', {
		_jsns: 'urn:zimbraMail'
	});
