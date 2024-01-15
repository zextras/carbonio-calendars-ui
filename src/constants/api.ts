/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const FOLDER_OPERATIONS = {
	COLOR: 'color',
	RENAME: 'rename',
	MOVE: 'move',
	DELETE: 'delete',
	GRANT: 'grant',
	REVOKE_GRANT: '!grant',
	CHECK: 'check',
	UNCHECK: '!check',
	TRASH: 'trash',
	EMPTY: 'empty',
	FREE_BUSY: 'fb'
} as const;
