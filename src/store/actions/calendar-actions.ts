/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Grant } from '@zextras/carbonio-shell-ui';
import { find, forEach, isArray, map, reject } from 'lodash';
import { getFolder, getUpdateFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { batchRequest } from '../../soap/batch-request';
import { folderActionRequest } from '../../soap/folder-action-request';
import { FolderActionRequest } from '../../types/soap/soap-actions';

type GrantAction = {
	id: string;
	zid: string;
	d: string;
};

const updateFolderGrants = (action: GrantAction, grant: Grant): void => {
	const currentFolder = getFolder(action.id);
	const updateFolder = getUpdateFolder();
	const currentAcl = find(currentFolder?.acl?.grant, ['d', action.d]);
	if (currentAcl && currentFolder?.acl?.grant) {
		const newGrantValue = { d: action.d, gt: grant.gt, perm: grant.perm, zid: action.zid };
		const updatedGrant = [...reject(currentFolder.acl.grant, ['d', action.d]), newGrantValue];
		updateFolder(action.id, { acl: { grant: updatedGrant } });
	} else {
		const newGrantValue = { d: action.d, gt: grant.gt, perm: grant.perm, zid: action.zid };
		updateFolder(action.id, {
			acl: { grant: [...(currentFolder?.acl?.grant ?? []), newGrantValue] }
		});
	}
};

export const folderAction = async ({
	id,
	op,
	zid,
	changes
}: {
	id: Array<string> | string;
	zid?: string;
	op: string;
	changes?: any;
}): Promise<any> => {
	if (isArray(id)) {
		const body: FolderActionRequest = {
			_jsns: 'urn:zimbra',
			onerror: 'continue',
			FolderActionRequest: map(id, (i, idx) => ({
				action: { op, id: i },
				requestId: idx,
				_jsns: 'urn:zimbraMail'
			}))
		};
		return batchRequest(body);
	}
	if (changes?.grant?.length > 1) {
		const body: FolderActionRequest = {
			_jsns: 'urn:zimbra',
			onerror: 'continue',
			FolderActionRequest: map(changes.grant, (grant, idx) => ({
				action: { op, id, grant: [grant] },
				requestId: parseInt(idx, 10),
				_jsns: 'urn:zimbraMail'
			}))
		};
		const res = await batchRequest(body);
		if (op === 'grant' && !res.Fault && res.FolderActionResponse.length > 1) {
			forEach(res.FolderActionResponse, (response) => {
				if (!response.Fault) {
					const currentUserGrant = find(changes.grant, ['d', response?.action?.d]);
					if (currentUserGrant) {
						updateFolderGrants(response.action, currentUserGrant);
					}
				}
			});
		}
		return res;
	}
	const res = await folderActionRequest({
		id,
		op,
		zid,
		changes
	});
	if (op === 'grant' && !res.Fault) {
		updateFolderGrants(res.action, changes.grant);
	}
	return res;
};
