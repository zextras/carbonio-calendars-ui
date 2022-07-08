/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getFolderRequest = async ({ id }: { id: string }): Promise<any> =>
	soapFetch('GetFolder', {
		_jsns: 'urn:zimbraMail',
		folder: {
			l: id
		}
	});
