/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type

export const getEmptyResponse = (): GetFreeBusyResponse => ({
	Header: {
		context: {
			session: { id: 191337, _content: 191337 }
		}
	},
	Body: {
		GetFreeBusyResponse: { usr: [], _jsns: 'urn:zimbraMail' }
	},
	_jsns: 'urn:zimbraSoap'
});
type TimeSlot = { s: number; e: number };
type TimeSlots = Array<TimeSlot>;
export type AvailabilitySlots = { f?: TimeSlots; b?: TimeSlots; t?: TimeSlots; id?: string };
type GetFreeBusyResponse = {
	_jsns: string;
	Header: { context: { session: { id: number; _content: number } } };
	Body: {
		GetFreeBusyResponse: {
			_jsns: string;
			usr: Array<AvailabilitySlots> | [];
		};
	};
};
export const handleGetFreeBusyCustomResponse = (
	arg?: Array<AvailabilitySlots>
): GetFreeBusyResponse => ({
	Header: {
		context: {
			session: { id: 191337, _content: 191337 }
		}
	},
	Body: {
		GetFreeBusyResponse: {
			usr: arg ?? getEmptyResponse().Body.GetFreeBusyResponse.usr,
			_jsns: 'urn:zimbraMail'
		}
	},
	_jsns: 'urn:zimbraSoap'
});

export const handleGetFreeBusy: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getEmptyResponse();
	return HttpResponse.json(response);
};
