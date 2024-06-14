/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const EventActionsEnum = {
	EXPAND: 'expand',
	TRASH: 'trash',
	MOVE: 'move',
	EDIT: 'edit',
	EDIT_TAGS: 'edit_tags',
	PRINT: 'print',
	REPLY_ALL: 'reply_all',
	FORWARD: 'forward',
	SHOW_ORIGNAL: 'show_orignal',
	CREATE_COPY: 'create_copy',
	REINVITE_ATT: 'reinvite_attendees',
	ACCEPT: 'accept',
	TENTATIVE: 'tentative',
	DECLINE: 'decline',
	PROPOSE_NEW_TIME: 'propose_new_time',
	REPLY: 'reply',
	FIND_SHARES: 'find_shares',
	EXPAND_SERIES: 'expand_series',
	DELETE_PERMANENTLY: 'deletePermanently',
	NEW_TAG: 'new_tag',
	DELETE_TAG: 'delete_tag',
	EDIT_TAG: 'edit_tag',
	APPLY_TAG: 'apply_tag',
	INSTANCE: 'instance',
	SERIES: 'series',
	SHOW_ORIGINAL: 'show_original',
	DOWNLOAD_ICS: 'download_ics',
	ANSWER: 'answer'
} as const;

export const CalendarIntegrations = {
	CREATE_APPOINTMENT: 'create_appointment'
} as const;

export type ObjectValues<T> = T[keyof T];

export type CalendarIntegrationId = ObjectValues<typeof CalendarIntegrations>;
export type EventActionsId = ObjectValues<typeof EventActionsEnum>;
