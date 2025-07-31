/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch, ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

export type DeleteCalendarGroupRequest = {
	id: string;
	_jsns: typeof JSNS.mail;
};

export type DeleteCalendarGroupResponse = {
	group: {
		id: string;
	};
	_jsns: typeof JSNS.mail;
};

export const deleteCalendarGroupRequest = async ({
	id
}: {
	id: string;
}): Promise<DeleteCalendarGroupResponse> =>
	legacySoapFetch<DeleteCalendarGroupRequest, DeleteCalendarGroupResponse | ErrorSoapBodyResponse>(
		'DeleteCalendarGroup',
		{
			_jsns: JSNS.mail,
			id
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return response;
	});
