/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, filter, map, reduce } from 'lodash';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function shareCalenderFullFilled(state: CalendarSlice, { payload, meta }: any): any {
	const { shareWithUserRole, shareWithUserType, grant, folder } = meta.arg;
	const { FolderActionResponse } = payload.response.Body.BatchResponse;
	const tmpAcl = map(FolderActionResponse, (a) => a.action);
	const currentFolder = cloneDeep(state).calendars[folder];
	const aclReduce = currentFolder.acl?.grant
		? reduce(
				currentFolder.acl?.grant,
				(r: Array<any>, v: any) => {
					if (filter(tmpAcl, { d: v.d }).length > 0) {
						// if (find(currentFolder.acl?.grant, grant)) {
						return [...r, { d: v.d, gt: grant.gt, perm: shareWithUserRole, zid: v.zid }];
					}
					return [...r, v];
				},
				[]
		  )
		: map(tmpAcl, (a) => ({
				d: a.d,
				gt: shareWithUserType,
				perm: shareWithUserRole,
				zid: a.zid
		  }));

	const updatedFolder = {
		...currentFolder,
		acl: aclReduce.length > 0 ? { grant: aclReduce } : {}
	};

	state.calendars[folder] = updatedFolder;
}
