/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export type SnoozeCalendarItemAlarmRejectedType = { error: boolean; Fault: any };
export type SnoozeCalendarItemAlarmFulfilledType = { Fault?: never; error?: never };
export type SnoozeCalendarItemAlarmReturnType =
	| SnoozeCalendarItemAlarmFulfilledType
	| SnoozeCalendarItemAlarmRejectedType;

export const snoozeCalendarItemAlarmRequest = async ({
	id,
	until
}: {
	id: string;
	until: number;
}): Promise<SnoozeCalendarItemAlarmReturnType> => {
	const response: SnoozeCalendarItemAlarmReturnType = await soapFetch('SnoozeCalendarItemAlarm', {
		_jsns: 'urn:zimbraMail',
		appt: [{ id, until }]
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
