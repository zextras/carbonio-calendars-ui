/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, JSNS, soapFetch } from '@zextras/carbonio-shell-ui';

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
		calendarId: { _content: string }[];
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
	soapFetch<ModifyCalendarGroupRequest, ModifyCalendarGroupResponse | ErrorSoapBodyResponse>(
		'ModifyCalendarGroup',
		{
			_jsns: 'urn:zimbraMail',
			id,
			name,
			calendarId: calendarIds.map((id: string) => ({ _content: id }))
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return response;
	});
