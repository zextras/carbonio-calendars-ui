/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

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
		attrs: 'email,zimbraCalResType,fullName',
		searchFilter: {
			conds: {
				or: '1',
				cond: {
					attr: 'zimbraCalResType',
					op: 'eq',
					value
				}
			}
		},
		_jsns: 'urn:zimbraAccount'
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
