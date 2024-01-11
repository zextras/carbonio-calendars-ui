/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';

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
					id: faker.datatype.uuid(),
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
					id: faker.datatype.uuid(),
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleSearchCalendarResourcesRequest = (req, res, ctx) => {
	if (req.body.Body.SearchCalendarResourcesRequest.searchFilter.conds.cond.value === 'Location') {
		const response = getLocationResponse();
		return res(ctx.json(response));
	}
	const response = getEquipmentResponse();
	return res(ctx.json(response));
};
