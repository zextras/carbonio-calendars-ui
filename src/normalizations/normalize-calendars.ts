/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Folder, LinkFolder } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';
import { ZimbraFolder } from '../types/zimbra';
import { ZIMBRA_STANDARD_COLORS } from '../commons/zimbra-standard-colors';
import { Calendar } from '../types/store/calendars';
import { setCalendarColor } from './normalizations-utils';

export const normalizeCalendar = (folder: Folder): Calendar => ({
	checked: /#/.test(folder.f ?? ''),
	broken: (folder as LinkFolder)?.broken ?? false,
	freeBusy: /b/.test(folder.f ?? ''),
	deletable: folder.deletable,
	absFolderPath: folder.absFolderPath,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	color: folder.color ? ZIMBRA_STANDARD_COLORS[folder.color] : setCalendarColor(folder),
	id: folder.id,
	name: folder.name,
	n: folder.n ?? 0,
	parent: folder.l,
	rid: (folder as LinkFolder)?.rid,
	owner: (folder as LinkFolder)?.owner, // It's specified only if It's not the current user
	zid: (folder as LinkFolder)?.zid,
	acl: folder.acl,
	isShared: !!(folder as LinkFolder)?.owner,
	perm: folder.perm,
	haveWriteAccess: folder.perm ? /w/.test(folder.perm) : true
});

export const normalizePartialCalendar = (folder: ZimbraFolder): any => ({
	checked: !isNil(folder.f) ? /#/.test(folder.f) : undefined,
	freeBusy: !isNil(folder.f) ? /b/.test(folder.f) : undefined,
	appointments: folder.appt ?? [{ ids: '' }],
	deletable: folder.deletable,
	absFolderPath: folder.absFolderPath,
	color: folder.color ? ZIMBRA_STANDARD_COLORS[folder.color] : undefined,
	id: folder.id,
	name: folder.name,
	parent: folder.l,
	rid: folder.rid,
	n: folder.n,
	owner: folder.owner, // It's specified only if It's not the current user
	zid: folder.zid,
	acl: folder.acl,
	isShared: !isNil(folder.owner) ? !!folder.owner : undefined,
	perm: folder.perm,
	haveWriteAccess: folder.perm ? /w/.test(folder.perm) : true
});
