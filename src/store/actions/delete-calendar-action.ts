/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isArray, map } from 'lodash';

import { batchRequest } from '../../soap/batch-request';
import { deleteCalendarRequest } from '../../soap/delete-calendar-request';
import { FolderAction, FolderActionBatchRequest } from '../../types/soap/soap-actions';

export const deleteCalendarAction = async (
	actions: Array<FolderAction> | FolderAction
): Promise<any> => {
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
	return deleteCalendarRequest(actions);
};
