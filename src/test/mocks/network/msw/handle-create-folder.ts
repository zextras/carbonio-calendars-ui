/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: { id: 150973, _content: 150973 },
			change: { token: 15954 }
		}
	},
	Body: {
		CreateFolderResponse: {
			folder: [
				{
					id: faker.random.numeric(),
					uuid: '70f277d0-76bf-4793-8b8a-6e7743516516',
					deletable: true,
					name: 'ciccio',
					absFolderPath: '/ciccio',
					l: '1',
					luuid: '675a66e9-cde4-434f-b853-236de184bae2',
					f: 'b',
					color: 3,
					view: 'appointment',
					rev: 15954,
					ms: 15954,
					webOfflineSyncDays: 0,
					activesyncdisabled: false,
					n: 0,
					s: 0,
					i4ms: 15954,
					i4next: 7573
				}
			],
			_jsns: 'urn:zimbraMail'
		}
	}
});

export const handleCreateFolderRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getResponse();
	return HttpResponse.json(response);
};
