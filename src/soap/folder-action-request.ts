/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { FolderAction } from '../types/soap/soap-actions';

export const folderActionRequest = async (action: FolderAction): Promise<any> =>
	legacySoapFetch('FolderAction', {
		action,
		_jsns: 'urn:zimbraMail'
	});
