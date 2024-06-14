/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

const getLocationResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: { id: 150973, _content: 150973 },
			change: { token: 15954 }
		}
	},
	Body: {
		SearchCalendarResourcesResponse: {
			paginationSupported: true,
			calresource: [
				{
					name: 'location@location.com',
					id: faker.string.uuid(),
					_attrs: {
						zimbraCalResType: 'Location',
						fullName: 'location',
						email: 'location@location.com'
					}
				}
			],
			sortBy: 'dateDesc',
			offset: 0,
			more: false,
			_jsns: 'urn:zimbraAccount'
		}
	}
});

const getEquipmentResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: { id: 150973, _content: 150973 },
			change: { token: 15954 }
		}
	},
	Body: {
		SearchCalendarResourcesResponse: {
			paginationSupported: true,
			calresource: [
				{
					name: 'equipment@equipment.com',
					id: faker.string.uuid(),
					_attrs: {
						zimbraCalResType: 'Equipment',
						fullName: 'equipment',
						email: 'equipment@equipment.com'
					}
				}
			],
			sortBy: 'dateDesc',
			offset: 0,
			more: false,
			_jsns: 'urn:zimbraAccount'
		}
	}
});

// TODO: fix types with the msw handlers refactor
export const handleSearchCalendarResourcesRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = async ({ request }) => {
	if (
		(await request.json()).Body.SearchCalendarResourcesRequest.searchFilter.conds.cond.value ===
		'Location'
	) {
		const response = getLocationResponse();
		return HttpResponse.json(response);
	}
	const response = getEquipmentResponse();
	return HttpResponse.json(response);
};
