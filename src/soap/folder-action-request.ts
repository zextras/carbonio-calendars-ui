/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const folderActionRequest = async ({
	id,
	zid,
	op,
	changes
}: {
	id: string;
	op: string;
	zid?: string;
	changes?: any;
}): Promise<any> => {
	const action = omitBy(
		{
			id,
			op,
			l: changes?.parent,
			recursive: changes?.recursive,
			name: changes?.name,
			color: changes?.color,
			grant: changes?.grant,
			f:
				changes?.excludeFreeBusy || changes?.checked
					? `${changes?.excludeFreeBusy ? 'b' : ''}${changes?.checked ? '#' : ''}`
					: undefined,
			zid
		},
		isNil
	);

	return soapFetch('FolderAction', {
		action,
		_jsns: 'urn:zimbraMail'
	});
};
