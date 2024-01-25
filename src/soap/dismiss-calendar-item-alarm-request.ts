/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { DateType } from '../types/event';

export type DismissItem = Array<{ id: string; dismissedAt: DateType }>;

export type DismissCalendarItemAlarmRejectedType = { error: boolean; m?: never; Fault: any };
export type DismissCalendarItemAlarmFulfilledType = { m: any; Fault?: never; error?: never };
export type DismissCalendarItemAlarmReturnType =
	| DismissCalendarItemAlarmFulfilledType
	| DismissCalendarItemAlarmRejectedType;

export const dismissCalendarItemAlarmRequest = async ({
	items
}: {
	items: DismissItem;
}): Promise<DismissCalendarItemAlarmReturnType> => {
	const response: DismissCalendarItemAlarmReturnType = await soapFetch('DismissCalendarItemAlarm', {
		_jsns: 'urn:zimbraMail',
		appt: items
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
