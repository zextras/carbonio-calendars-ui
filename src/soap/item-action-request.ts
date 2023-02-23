/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const itemActionRequest = async ({
	inviteId,
	id,
	op,
	tagName,
	parent
}: {
	inviteId?: string;
	id?: string;
	op: string;
	tagName?: string;
	parent?: string;
}): Promise<any> =>
	soapFetch('ItemAction', {
		_jsns: 'urn:zimbraMail',
		action: omitBy(
			{
				op,
				id: inviteId ?? id,
				tn: tagName,
				l: parent
			},
			isNil
		)
	});
