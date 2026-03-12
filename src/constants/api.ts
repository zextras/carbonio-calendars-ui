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
	FREE_BUSY: 'fb',
	SYNC: 'sync'
} as const;

export const PARTICIPANT_ROLE = {
	REQUIRED: 'REQ',
	OPTIONAL: 'OPT',
	NON_PARTICIPANT: 'NON'
} as const;

export const PARTICIPATION_STATUS = {
	NEED_ACTION: 'NE',
	ACCEPTED: 'AC',
	DECLINED: 'DE',
	TENTATIVE: 'TE'
} as const;

export const EVENT_DISPLAY_STATUS = {
	FREE: 'F',
	BUSY: 'B',
	TENTATIVE: 'T',
	OUT_OF_OFFICE: 'O'
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

export const USERS_PERMISSIONS_RIGHTS = {
	ALLOW_INTERNAL_EXTERNAL: 'allowInternalExternal',
	ALLOW_INTERNAL: 'allowInternal',
	ALLOW_DOMAIN_USERS: 'allowDomainUsers',
	ALLOW_NONE: 'allowNone',
	ALLOW_FOLLOWING: 'allowFollowing'
} as const;

export const GRANTEE_TYPES = {
	USR: 'usr',
	GRP: 'grp',
	EGP: 'egp',
	ALL: 'all',
	DOM: 'dom',
	EDOM: 'edom',
	GST: 'gst',
	KEY: 'key',
	PUB: 'pub',
	EMAIL: 'email'
};

type ObjectValues<T> = T[keyof T];

export type ParticipantRoleType = ObjectValues<typeof PARTICIPANT_ROLE>;
export type PermissionsRightsOptions = ObjectValues<typeof USERS_PERMISSIONS_RIGHTS> | null;
export type Granteetypes = ObjectValues<typeof USERS_PERMISSIONS_RIGHTS> | null;
