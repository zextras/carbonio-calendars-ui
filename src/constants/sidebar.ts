/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line no-shadow
export enum FOLDER_ACTIONS {
	MOVE_TO_ROOT = 'moveToRoot',
	EMPTY_TRASH = 'emptyTrash',
	REMOVE_FROM_LIST = 'removeFromList',
	SHARES_INFO = 'sharesInfo',
	EDIT = 'edit',
	NEW = 'new',
	DELETE = 'delete',
	SHARE = 'share',
	SHARE_URL = 'share_url',
	FIND_SHARES = 'find_shares',
	EXPORT_ICS = 'export_ics',
	UPLOAD = 'upload'
}

// eslint-disable-next-line no-shadow
export enum SIDEBAR_ITEMS {
	ALL_CALENDAR = 'all',
	SHARES = 'shares'
}

export type ObjectValues<T> = T[keyof T];

export type CalendarActionsId = ObjectValues<typeof FOLDER_ACTIONS>;
