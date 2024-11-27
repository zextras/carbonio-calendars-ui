/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

const getSuccessfulResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: { id: 150973, _content: 150973 },
			change: { token: 15954 }
		}
	},
	Body: {
		ItemActionResponse: {
			_jsns: 'urn:zimbraMail'
		}
	}
});

export const getItemActionRejectedResponse = () => ({
	Fault: {
		Code: {
			Value: 'soap:Sender'
		},
		Reason: {
			Text: 'invalid request: something is wrong'
		},
		Detail: {
			Error: {
				Code: 'service.INVALID_REQUEST',
				Trace: 'Error trace detail',
				_jsns: 'urn:zimbra'
			}
		}
	}
});

export const handleItemActionRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getSuccessfulResponse();
	return HttpResponse.json(response);
};
