/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export type CreateCalendarGroupResponse = {
	group: {
		id: string;
		name: string;
		calendarId: { _content: string }[];
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCalendarGroupRequest = async ({
	name,
	calendarIds
}: any): Promise<CreateCalendarGroupResponse> =>
	soapFetch('CreateCalendarGroup', {
		_jsns: 'urn:zimbraMail',
		name,
		calendarId: calendarIds.map((id: string) => ({ _content: id }))
	});
