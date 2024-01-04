/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { FolderAction } from '../types/soap/soap-actions';

export const folderActionRequest = async (action: FolderAction): Promise<any> =>
	soapFetch('FolderAction', {
		action,
		_jsns: 'urn:zimbraMail'
	});
