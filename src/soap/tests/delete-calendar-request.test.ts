/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { deleteCalendarRequest } from 'soap/delete-calendar-request';
import { generateApiErrorResponse } from 'test/generators/api';

const reqActionParams = {
	id: '0000',
	op: 'delete'
};

const response = {
	action: reqActionParams,
	_jsns: JSNS.mail
};

describe('deleteCalendarRequest', () => {
	it('should call the create folder API with the correct parameters', async () => {
		const apiCallInterceptor = createSoapAPIInterceptor('DeleteCalendar', response);

		await deleteCalendarRequest(reqActionParams);
		const apiParams = await apiCallInterceptor;

		expect(apiParams).toEqual(response);
	});

	it('should raise an error if the API call fails', async () => {
		const faultyResponse = generateApiErrorResponse();
		createSoapAPIInterceptor('DeleteCalendar', faultyResponse);

		expect(deleteCalendarRequest(reqActionParams)).rejects.toThrow(
			faultyResponse.Fault.Reason.Text
		);
	});
});
