/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const itemAction = async ({
	inviteId,
	operation,
	tagName
}: {
	inviteId: string;
	operation: string;
	tagName: string;
}): Promise<any> => {
	const response = await soapFetch('ItemAction', {
		_jsns: 'urn:zimbraMail',
		action: omitBy(
			{
				id: inviteId,
				op: operation,
				tn: tagName
			},
			isNil
		)
	});
	return { response, inviteId };
};
