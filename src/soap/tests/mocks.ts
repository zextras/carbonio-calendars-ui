/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { GetShareInfoRequest, GetShareInfoResponse } from '@zextras/carbonio-ui-commons';

import { GetFreeBusyRequest, GetFreeBusyResponse } from '../get-free-busy-request';
import {
	GetWorkingHoursSoapRequest,
	GetWorkingHoursSoapResponse
} from '../get-non-working-hours-request';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

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

export function mockGetShareInfo(): Promise<GetShareInfoRequest> {
	return createSoapAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
		_jsns: '',
		share: []
	});
}
