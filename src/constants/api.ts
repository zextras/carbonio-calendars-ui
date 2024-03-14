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

export const PARTICIPANT_ROLE = {
	REQUIRED: 'REQ',
	OPTIONAL: 'OPT',
	NON_PARTICIPANT: 'NON'
} as const;

export const MESSAGE_METHOD = {
	COUNTER: 'COUNTER',
	REQUEST: 'REQUEST'
} as const;

export const SEARCH_RESOURCES_ATTRS = {
	EMAIL: 'email',
	CAL_RES_TYPE: 'zimbraCalResType',
	FULL_NAME: 'fullName'
} as const;

export const SEARCH_RESOURCE_OP = {
	EQUAL: 'eq'
} as const;

type ObjectValues<T> = T[keyof T];

export type ParticipantRoleType = ObjectValues<typeof PARTICIPANT_ROLE>;
