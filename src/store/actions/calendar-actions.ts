/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isArray, map } from 'lodash';

import { batchRequest } from '../../soap/batch-request';
import { folderActionRequest } from '../../soap/folder-action-request';
import {
	FolderAction,
	FolderActionBatchRequest,
	FolderActionResponse
} from '../../types/soap/soap-actions';

export const folderAction = async (
	actions: Array<FolderAction> | FolderAction
): Promise<FolderActionResponse> => {
	if (isArray(actions)) {
		const body: FolderActionBatchRequest = {
			_jsns: 'urn:zimbra',
			onerror: 'continue',
			FolderActionRequest: map(actions, (action, idx) => ({
				action,
				requestId: idx,
				_jsns: 'urn:zimbraMail'
			}))
		};
		return batchRequest(body);
	}
	return folderActionRequest(actions);
};
