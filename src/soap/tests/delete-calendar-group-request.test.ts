/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, JSNS } from '@zextras/carbonio-shell-ui';

import { generateApiErrorResponse } from '../../test/generators/api';
import {
	DeleteCalendarGroupRequest,
	deleteCalendarGroupRequest,
	DeleteCalendarGroupResponse
} from '../delete-calendar-group-request';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('DeleteCalendarGroupRequest', () => {
	it('should call the deletion API with the correct parameters', async () => {
		const groupId = '1';
		const response = {
			group: {
				id: groupId
			},
			_jsns: JSNS.mail
		};
		const apiCallInterceptor = createSoapAPIInterceptor<
			DeleteCalendarGroupRequest,
			DeleteCalendarGroupResponse
		>('DeleteCalendarGroup', response);

		await deleteCalendarGroupRequest({ id: groupId });
		const apiParams = await apiCallInterceptor;

		expect(apiParams).toEqual({
			id: groupId,
			_jsns: JSNS.mail
		});
	});

	it('should raise an error if the API call fails', async () => {
		const groupId = '1';
		const response = generateApiErrorResponse();
		createSoapAPIInterceptor<DeleteCalendarGroupRequest, ErrorSoapBodyResponse>(
			'DeleteCalendarGroup',
			response
		);

		expect(deleteCalendarGroupRequest({ id: groupId })).rejects.toThrow(response.Fault.Reason.Text);
	});
});
