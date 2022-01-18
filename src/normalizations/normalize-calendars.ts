/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isNil } from 'lodash';
import { ZimbraFolder } from '../types/zimbra';
import { ZIMBRA_STANDARD_COLORS } from '../commons/zimbra-standard-colors';
import { Calendar } from '../types/store/calendars';
import { setCalendarColor } from './normalizations-utils';

export const normalizeCalendar = (folder: ZimbraFolder): Calendar => ({
	checked: /#/.test(folder.f),
	freeBusy: /b/.test(folder.f),
	appointments: folder.appt ?? [{ ids: '' }],
	deletable: folder.deletable,
	absFolderPath: folder.absFolderPath,
	color: folder.color ? ZIMBRA_STANDARD_COLORS[folder.color] : setCalendarColor(folder),
	id: folder.id,
	name: folder.name,
	parent: folder.l,
	rid: folder.rid,
	owner: folder.owner, // It's specified only if It's not the current user
	zid: folder.zid,
	acl: folder.acl,
	isShared: !!folder.owner
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
	owner: folder.owner, // It's specified only if It's not the current user
	zid: folder.zid,
	acl: folder.acl,
	isShared: !isNil(folder.owner) ? !!folder.owner : undefined
});
