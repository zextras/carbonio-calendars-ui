/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import {
	DismissCalendarItemAlarmRequest,
	dismissCalendarItemAlarmRequest,
	DismissCalendarItemAlarmReturnType
} from 'soap/dismiss-calendar-item-alarm-request';

const response = {
	m: 10
};

const reqActionParams = {
	items: [{ id: 'item1', dismissedAt: 1700000000 }]
};

describe('dismissCalendarItemAlarmRequest', () => {
	it('should call dismiss calendar item API with the correct parameters', async () => {
		const apiCallInterceptor = createSoapAPIInterceptor<
			DismissCalendarItemAlarmRequest,
			DismissCalendarItemAlarmReturnType
		>('DismissCalendarItemAlarm', response);

		await dismissCalendarItemAlarmRequest(reqActionParams);
		const apiParams = await apiCallInterceptor;

		expect(apiParams).toEqual({
			appt: reqActionParams.items,
			_jsns: JSNS.mail
		});
	});
});
