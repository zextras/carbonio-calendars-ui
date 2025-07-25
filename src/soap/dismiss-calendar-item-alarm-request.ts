/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

export type DismissItem = Array<{ id: string; dismissedAt: number }>;
export type DismissCalendarItemAlarmRequest = {
	items: DismissItem;
};

export type DismissCalendarItemAlarmRejectedType = { error: boolean; m?: never; Fault: any };
export type DismissCalendarItemAlarmFulfilledType = { m: any; Fault?: never; error?: never };
export type DismissCalendarItemAlarmReturnType =
	| DismissCalendarItemAlarmFulfilledType
	| DismissCalendarItemAlarmRejectedType;

export const dismissCalendarItemAlarmRequest = async ({
	items
}: DismissCalendarItemAlarmRequest): Promise<DismissCalendarItemAlarmReturnType> => {
	const response: DismissCalendarItemAlarmReturnType = await legacySoapFetch(
		'DismissCalendarItemAlarm',
		{
			_jsns: JSNS.mail,
			appt: items
		}
	);
	if ('Fault' in response) {
		// TODO HANDLE ERROR INSTEAD OF RETURN RESPONSE throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		return { ...response.Fault, error: true };
	}
	return response;
};
