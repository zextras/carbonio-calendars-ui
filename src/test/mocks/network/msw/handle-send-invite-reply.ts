/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {}
	},
	Body: {
		SendInviteReplyResponse: {
			apptId: '45410',
			calItemId: '45410',
			invId: '45410-46701',
			_jsns: 'urn:zimbraMail'
		}
	}
});

export const handleSendInviteReplyRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getResponse();
	return HttpResponse.json(response);
};
