/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

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
	legacySoapFetch('GetCalendarGroups', {
		_jsns: JSNS.mail
	});
