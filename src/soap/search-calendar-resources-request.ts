/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SEARCH_RESOURCE_OP, SEARCH_RESOURCES_ATTRS } from '../constants/api';
import { Cn } from '../types/soap/soap-actions';

export type searchCalendarRejectedType = {
	error: boolean;
	Fault: any;
	calresource?: never;
	more?: never;
	offset?: never;
	sortBy?: never;
};

export type searchCalendarFulfilledType = {
	calresource?: Cn;
	Fault?: never;
	error?: never;
	more: boolean;
	offset: number;
	sortBy: string;
};

export type searchCalendarReturnType = searchCalendarFulfilledType | searchCalendarRejectedType;

export const searchCalendarResourcesRequest = async (
	value: string
): Promise<searchCalendarReturnType> => {
	const response: searchCalendarReturnType = await soapFetch('SearchCalendarResources', {
		attrs: `${SEARCH_RESOURCES_ATTRS.EMAIL},${SEARCH_RESOURCES_ATTRS.CAL_RES_TYPE},${SEARCH_RESOURCES_ATTRS.FULL_NAME}`,
		searchFilter: {
			conds: {
				or: '1',
				cond: {
					attr: SEARCH_RESOURCES_ATTRS.CAL_RES_TYPE,
					op: SEARCH_RESOURCE_OP.EQUAL,
					value
				}
			}
		},
		_jsns: 'urn:zimbraAccount'
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
