/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, FOLDERS, getFolderIdParts, isLink, isRoot } from '@zextras/carbonio-ui-commons';

export const getCalendarSortCriteria = (calendar: Folder): string => {
	const { id, zid } = getFolderIdParts(calendar.id);
	if (isRoot(calendar.id)) {
		return zid === null ? `0100` : `0500-${calendar.name.toLowerCase()}`;
	}
	if (isLink(calendar)) {
		return `5000-${calendar.name.toLowerCase()}`;
	}
	switch (id) {
		case FOLDERS.CALENDAR:
			return `1000`;
		case FOLDERS.TRASH:
			return `2000`;
		default:
			return `3000-${calendar.name.toLowerCase()}`;
	}
};
