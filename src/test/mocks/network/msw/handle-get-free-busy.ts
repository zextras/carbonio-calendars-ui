/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
type AvailabilitySLots = { f?: TimeSlots; b?: TimeSlots; t?: TimeSlots; id?: string };
type GetFreeBusyResponse = {
	_jsns: string;
	Header: { context: { session: { id: number; _content: number } } };
	Body: {
		GetFreeBusyResponse: {
			_jsns: string;
			usr: Array<AvailabilitySLots> | [];
		};
	};
};
export const handleGetFreeBusyCustomResponse = (
	arg?: Array<AvailabilitySLots>
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleGetFreeBusy = (req, res, ctx) => {
	const response = getEmptyResponse();
	return res(ctx.json(response));
};
