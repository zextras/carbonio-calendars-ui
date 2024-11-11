/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { GetFreeBusyRequest, GetFreeBusyResponse } from '../get-free-busy-request';
import {
	GetWorkingHoursSoapRequest,
	GetWorkingHoursSoapResponse
} from '../get-working-hours-request';

export function mockFreeBusyResponse(
	usersFreeBusy: GetFreeBusyResponse['usr']
): Promise<GetFreeBusyRequest> {
	return createSoapAPIInterceptor<GetFreeBusyRequest, GetFreeBusyResponse>('GetFreeBusy', {
		usr: usersFreeBusy
	});
}

export function mockWorkingHoursResponse(
	workingHours: GetWorkingHoursSoapResponse['usr']
): Promise<GetWorkingHoursSoapRequest> {
	return createSoapAPIInterceptor<GetWorkingHoursSoapRequest, GetWorkingHoursSoapResponse>(
		'GetWorkingHours',
		{
			usr: workingHours
		}
	);
}
