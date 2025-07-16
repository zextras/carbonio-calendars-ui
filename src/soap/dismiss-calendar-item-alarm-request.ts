/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

export type DismissItem = Array<{ id: string; dismissedAt: number }>;

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
	const response: DismissCalendarItemAlarmReturnType = await legacySoapFetch(
		'DismissCalendarItemAlarm',
		{
			_jsns: 'urn:zimbraMail',
			appt: items
		}
	);
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
