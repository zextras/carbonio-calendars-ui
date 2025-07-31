/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch, ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { ModifyCalendarGroupError } from './errors/modify-calendar-group-error';

export type ModifyCalendarGroupRequest = {
	id: string;
	name: string;
	calendarId: { _content: string }[];
	_jsns: typeof JSNS.mail;
};

export type ModifyCalendarGroupResponse = {
	group: {
		id: string;
		name: string;
		calendarId?: { _content: string }[];
	};
	_jsns: typeof JSNS.mail;
};

export const modifyCalendarGroupRequest = async ({
	id,
	name,
	calendarIds
}: {
	id: string;
	name: string;
	calendarIds: Array<string>;
}): Promise<ModifyCalendarGroupResponse> =>
	legacySoapFetch<ModifyCalendarGroupRequest, ModifyCalendarGroupResponse | ErrorSoapBodyResponse>(
		'ModifyCalendarGroup',
		{
			_jsns: 'urn:zimbraMail',
			id,
			name,
			calendarId: calendarIds.map((id: string) => ({ _content: id }))
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new ModifyCalendarGroupError(response.Fault);
		}
		return response;
	});
