/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { DateType } from '../types/event';

type DismissItem = Array<{ id: string; dismissedAt: DateType }>;

export const dismissCalendarItemAlarmRequest = async ({
	items
}: {
	items: DismissItem;
}): Promise<any> =>
	soapFetch('DismissCalendarItemAlarm', {
		_jsns: 'urn:zimbraMail',
		appt: items
	});
