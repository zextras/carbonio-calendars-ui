/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch, ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { CreateCalendarGroupError } from './errors/create-calendar-group-error';

export type CreateCalendarGroupRequest = {
	name: string;
	calendarId: { _content: string }[];
	_jsns: typeof JSNS.mail;
};

export type CreateCalendarGroupResponse = {
	group: {
		id: string;
		name: string;
		calendarId?: { _content: string }[];
	};
	_jsns: typeof JSNS.mail;
};

export const createCalendarGroupRequest = async ({
	name,
	calendarIds
}: {
	name: string;
	calendarIds: Array<string>;
}): Promise<CreateCalendarGroupResponse> =>
	legacySoapFetch<CreateCalendarGroupRequest, CreateCalendarGroupResponse | ErrorSoapBodyResponse>(
		'CreateCalendarGroup',
		{
			_jsns: 'urn:zimbraMail',
			name,
			calendarId: calendarIds.map((id: string) => ({ _content: id }))
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new CreateCalendarGroupError(response.Fault);
		}
		return response;
	});
