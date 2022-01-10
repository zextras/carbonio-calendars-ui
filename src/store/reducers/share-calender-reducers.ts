/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { clone, cloneDeep, filter, find, forEach, map, reduce } from 'lodash';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function shareCalendarRejected(state: CalendarSlice, { meta, error }: any): any {
	const { arg, requestId } = meta;
	// state.calendars[arg.id || requestId].error = error; todo: check this line
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function shareCalenderFullFilled(state: CalendarSlice, { payload, meta }: any): any {
	const { shareWithUserRole, grant, folder } = meta.arg;
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
				gt: grant.gt,
				perm: shareWithUserRole,
				zid: a.zid
		  }));

	const updatedFolder = {
		...currentFolder,
		acl: aclReduce.length > 0 ? { grant: aclReduce } : {}
	};

	state.calendars[folder] = updatedFolder;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionPending(state: CalendarSlice, { payload, meta }: any): any {
	const { id, op, changes } = meta.arg;
	// eslint-disable-next-line no-param-reassign
	meta.arg.prevState = cloneDeep(state.calendars);
	switch (op) {
		case 'move':
			state.calendars[id].parent = changes.parent;
			state.status = 'updating';
			break;
		case 'trash':
			state.calendars[id].parent = '3';
			state.status = 'updating';
			break;
		case 'update':
			state.calendars[id] = {
				...state.calendars[id],
				parent: changes.parent,
				checked: true,
				color: ZIMBRA_STANDARD_COLORS[Number(meta.arg.changes.color)]
			};
			state.status = 'updating';
			break;
		case 'delete':
			delete state.calendars[id];
			state.status = 'updating';
			break;
		case '!check':
		case 'check':
			state.calendars[id].checked = changes.checked;
			state.status = 'updating';
			break;
		case 'empty':
			forEach(state.calendars, (value, key) => {
				if (value.parent === '3') delete state.calendars[key];
			});
			break;
		default:
			console.error('Operation not handled', op, meta.arg);
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionRejected(state: CalendarSlice, { payload, meta }: any): any {
	state.calendars = meta.arg.prevState;
	state.status = 'rejected';
}
// todo: check if calendar actions works properly
