/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 171942,
				_content: 171942
			},
			change: {
				token: 14386
			}
		}
	},
	Body: {
		FolderActionResponse: {
			action: {
				id: '2047',
				op: 'update'
			},
			_jsns: 'urn:zimbraMail'
		}
	}
});

export const handleFolderActionRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getResponse();
	return HttpResponse.json(response);
};
