/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export type ItemActionRejectedType = { error: boolean; m?: never; Fault: any };
export type ItemActionFulfilledType = { m: any; Fault?: never; error?: never };
export type ItemActionReturnType = ItemActionFulfilledType | ItemActionRejectedType;

export const itemActionRequest = async ({
	id,
	op,
	tagName,
	parent
}: {
	id?: string;
	op: string;
	tagName?: string;
	parent?: string;
}): Promise<ItemActionReturnType> => {
	const response: ItemActionReturnType = await soapFetch('ItemAction', {
		_jsns: 'urn:zimbraMail',
		action: omitBy(
			{
				op,
				id,
				tn: tagName,
				l: parent
			},
			isNil
		)
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
