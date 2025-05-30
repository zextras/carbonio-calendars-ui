/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '@test-utils/network/msw/handlers';

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

export const handleItemActionRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getSuccessfulResponse();
	return HttpResponse.json(response);
};
