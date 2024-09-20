/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isArray, map } from 'lodash';

import { SHARE_USER_TYPE } from '../../constants';
import { FOLDER_OPERATIONS } from '../../constants/api';
import { batchRequest } from '../../soap/batch-request';
import { folderActionRequest } from '../../soap/folder-action-request';
import { FolderAction, FolderActionRequest } from '../../types/soap/soap-actions';

export const folderAction = async (actions: Array<FolderAction> | FolderAction): Promise<any> => {
	if (isArray(actions)) {
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
	}
	return folderActionRequest(actions);
};

type GrantFolderAccess = {
	folderId: string;
	perm: string;
	grantees: Array<string>;
};

export const grantFolderAccess = async (req: GrantFolderAccess): Promise<boolean> => {
	const responses = await Promise.all(
		req.grantees.map((email) => {
			const grant = {
				gt: SHARE_USER_TYPE.USER,
				inh: '1',
				d: email,
				perm: req.perm,
				pw: ''
			};
			return folderAction({
				id: req.folderId,
				op: FOLDER_OPERATIONS.GRANT,
				grant
			});
		})
	);
	return responses.every((r) => r.Fault === undefined);
};
