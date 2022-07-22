/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const snoozeCalendarItemAlarmRequest = async ({
	id,
	until
}: {
	id: string;
	until: number;
}): Promise<any> =>
	soapFetch('SnoozeCalendarItemAlarm', {
		_jsns: 'urn:zimbraMail',
		appt: [{ id, until }]
	});
