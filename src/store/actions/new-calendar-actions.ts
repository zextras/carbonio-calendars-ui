/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';

import { batchRequest } from '../../soap/batch-request';
import { FolderActionRequest } from '../../types/soap/soap-actions';

export const folderAction = async (actions: Array<any>): Promise<any> => {
	const body: FolderActionRequest = {
		_jsns: 'urn:zimbra',
		onerror: 'continue',
		FolderActionRequest: map(actions, (action, idx) => ({
			action,
			requestId: idx,
			_jsns: 'urn:zimbraMail'
		}))
	};
	return batchRequest(body);
};
