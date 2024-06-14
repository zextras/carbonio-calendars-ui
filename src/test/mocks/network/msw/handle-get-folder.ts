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
			session: { id: 191337, _content: 191337 }
		}
	},
	Body: {
		GetFolderResponse: {
			folder: [
				{
					id: '2048',
					uuid: 'aa4ba186-a8a2-4382-bc52-c3fd9eae9d85',
					deletable: true,
					name: 'calendar 2',
					absFolderPath: '/calendar 2',
					l: '1',
					luuid: '953b88ab-a670-47df-ae59-a66288a8b5c5',
					f: '#i',
					view: 'appointment',
					rev: 8239,
					ms: 13276,
					webOfflineSyncDays: 0,
					activesyncdisabled: false,
					n: 1,
					s: 0,
					i4ms: 13151,
					i4next: 3799,
					acl: {
						grant: [
							{
								zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
								gt: 'usr',
								perm: 'r',
								d: faker.internet.email({ firstName: faker.person.firstName() })
							}
						]
					}
				}
			],
			_jsns: 'urn:zimbraMail'
		}
	}
});

export const handleGetFolderRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getResponse();
	return HttpResponse.json(response);
};
