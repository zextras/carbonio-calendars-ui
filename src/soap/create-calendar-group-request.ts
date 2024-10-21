/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS, soapFetch } from '@zextras/carbonio-shell-ui';

export type CreateCalendarGroupRequest = {
	name: string;
	calendarId: { _content: string }[];
	_jsns: typeof JSNS.mail;
};

export type CreateCalendarGroupResponse = {
	group: {
		id: string;
		name: string;
		calendarId: { _content: string }[];
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
	soapFetch<CreateCalendarGroupRequest, CreateCalendarGroupResponse>('CreateCalendarGroup', {
		_jsns: 'urn:zimbraMail',
		name,
		calendarId: calendarIds.map((id: string) => ({ _content: id }))
	});
