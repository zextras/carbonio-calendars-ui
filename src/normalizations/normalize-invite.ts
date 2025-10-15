/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, isNil } from 'lodash';

import {
	normalizeMailPartMapFn,
	getAlarmToString,
	normalizeInviteParticipants,
	retrieveAttachmentsType,
	findAttachments,
	getAlarmValueInMinutes
} from './normalizations-utils';
import { getLocationUrl } from './normalize-calendar-events';
import { EVENT_DISPLAY_STATUS } from 'constants/api';
import { Invite } from 'types/store/invite';

interface MailPart {
	contentType?: string;
	content?: string;
	parts?: MailPart[];
}

interface DescriptionContent {
	html?: string;
	text?: string;
}

interface DescriptionArray {
	_content: string;
}

/**
 * Recursively extracts HTML and plain text content from mail parts
 * @param parts - The mail parts structure to search through
 * @returns Object containing extracted HTML and text content
 */
const extractDescriptionFromParts = (parts: MailPart[]): DescriptionContent => {
	const result: DescriptionContent = {};

	const findContentInParts = (partsList: MailPart[]): void => {
		if (!partsList) return;

		partsList.forEach((part) => {
			if (!part) return;

			if (part.contentType === 'text/html' && part.content && !result.html) {
				result.html = part.content;
			}

			if (part.contentType === 'text/plain' && part.content && !result.text) {
				result.text = part.content;
			}

			if (part.parts) {
				findContentInParts(part.parts);
			}
		});
	};

	findContentInParts(parts);
	return result;
};

/**
 * Normalizes description data from various formats (array, string, or parts)
 * into a consistent array format
 * @param description - Description from invite component (can be array or string)
 * @param fallbackContent - Fallback content extracted from mail parts
 * @returns Normalized description as an array
 */
const normalizeDescription = (
	description: string | Array<DescriptionArray> | undefined,
	fallbackContent?: string
): Array<DescriptionArray> => {
	if (Array.isArray(description) && description.length > 0) {
		return description;
	}

	if (typeof description === 'string' && description) {
		return [{ _content: description }];
	}

	if (fallbackContent) {
		return [{ _content: fallbackContent }];
	}

	return [];
};

/**
 * Normalizes tag data from comma-separated string to array
 * @param tagString - Comma-separated tag string
 * @returns Array of non-empty tag strings
 */
const normalizeTags = (tagString?: string): string[] => {
	if (isNil(tagString)) return [];
	return filter(tagString.split(','), (tag) => tag !== '');
};

/**
 * Extracts the first component from an invite structure
 * Helper to reduce repetitive deep property access
 */
// TODO: type this properly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getInviteComponent = (inv: any): any => inv?.[0]?.comp?.[0];

/**
 * Normalizes a calendar invite from message data
 * @param m - Raw message data containing invite information
 * @returns Normalized Invite object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeInvite = (m: any): Invite => {
	const inviteComponent = getInviteComponent(m?.inv);

	const descFromParts = extractDescriptionFromParts(m.parts ?? []);
	const htmlDescription = normalizeDescription(inviteComponent?.descHtml, descFromParts.html);
	const textDescription = normalizeDescription(inviteComponent?.desc, descFromParts.text);

	const alarmTrigger = inviteComponent?.alarm?.[0]?.trigger?.[0]?.rel?.[0];

	return {
		// Calendar folder and appointment identifiers
		ciFolder: inviteComponent?.ciFolder,
		apptId: inviteComponent?.apptId,
		id: m.id,
		compNum: inviteComponent?.compNum,

		// Basic appointment properties
		allDay: inviteComponent?.allDay ?? false,
		name: inviteComponent?.name,
		location: inviteComponent?.loc ?? '',
		locationUrl: getLocationUrl(inviteComponent?.loc ?? ''),

		// Date/time and timezone
		tz: find(m?.inv?.[0]?.tz, (value) => value.id !== 'UTC')?.id,
		start: inviteComponent?.s?.[0],
		end: inviteComponent?.e?.[0],
		date: m.d,

		// Descriptions
		textDescription,
		htmlDescription,
		fragment: inviteComponent?.fr,

		// Participants and organizer
		attendees: inviteComponent?.at ?? [],
		participants: normalizeInviteParticipants(inviteComponent?.at ?? []),
		organizer: inviteComponent?.or,
		isOrganizer: inviteComponent?.isOrg ?? false,
		isRespRequested: inviteComponent?.rsvp,

		// Status and visibility
		status: inviteComponent?.status,
		class: inviteComponent?.class,
		freeBusy: inviteComponent?.fb ?? EVENT_DISPLAY_STATUS.BUSY,
		freeBusyActualStatus: inviteComponent?.fba ?? EVENT_DISPLAY_STATUS.BUSY,
		transparency: inviteComponent?.transp,

		// Recurrence and exceptions
		recurrenceRule: inviteComponent?.recur,
		isException: inviteComponent?.ex ?? false,
		exceptId: inviteComponent?.exceptId,

		// Alarms/reminders
		alarm: !!inviteComponent?.alarm,
		alarmData: inviteComponent?.alarm,
		alarmString: getAlarmToString(inviteComponent?.alarm),
		alarmValue: getAlarmValueInMinutes(alarmTrigger),

		// Metadata and flags
		parent: m.l,
		flags: m.f,
		sequenceNumber: inviteComponent?.seq,
		uid: inviteComponent?.uid,
		url: inviteComponent?.url,
		noBlob: inviteComponent?.noBlob,
		ms: m.ms || 0,
		rev: m.rev || 0,
		meta: m.meta,
		xprop: inviteComponent?.xprop,
		neverSent: inviteComponent?.neverSent ?? false,

		// Tags
		tagNamesList: m.tn,
		tags: normalizeTags(m.t),

		// Attachments
		parts: m.mp ? normalizeMailPartMapFn(m.mp) : [],
		attach: {
			mp: retrieveAttachmentsType(m?.mp?.[0] ?? [], 'attachment', m?.id)
		},
		attachmentFiles: findAttachments(m.mp ?? [], [])
	};
};

/**
 * Normalizes a calendar invite from sync data
 * @param inv - Raw invite data from sync operation
 * @returns Normalized Invite object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeInviteFromSync = (inv: any): Invite => {
	const inviteComponent = inv?.comp?.[0];
	const alarmTrigger = inviteComponent?.alarm?.[0]?.trigger?.[0]?.rel?.[0];

	return {
		// Calendar folder and appointment identifiers
		ciFolder: inviteComponent?.ciFolder,
		apptId: inviteComponent?.apptId,
		id: `${inviteComponent?.apptId}-${inv.id}`,
		compNum: inviteComponent?.compNum,

		// Basic appointment properties
		allDay: !!inviteComponent?.allDay,
		name: inviteComponent?.name,
		location: inviteComponent?.loc ?? '',
		locationUrl: getLocationUrl(inviteComponent?.loc ?? ''),

		// Date/time and timezone
		tz: find(inv?.tz, (value) => value.id !== 'UTC')?.id,
		start: inviteComponent?.s?.[0],
		end: inviteComponent?.e?.[0],
		date: inv.d,

		// Descriptions (sync data doesn't need normalization)
		textDescription: inviteComponent?.desc,
		htmlDescription: inviteComponent?.descHtml,
		fragment: inviteComponent?.fr,

		// Participants and organizer
		attendees: inviteComponent?.at ?? [],
		participants: normalizeInviteParticipants(inviteComponent?.at ?? []),
		organizer: inviteComponent?.or,
		isOrganizer: !!inviteComponent?.isOrg,
		isRespRequested: inviteComponent?.rsvp,

		// Status and visibility
		status: inviteComponent?.status,
		class: inviteComponent?.class,
		freeBusy: inviteComponent?.fb ?? EVENT_DISPLAY_STATUS.BUSY,
		freeBusyActualStatus: inviteComponent?.fba ?? EVENT_DISPLAY_STATUS.BUSY,
		transparency: inviteComponent?.transp,

		// Recurrence and exceptions
		recurrenceRule: inviteComponent?.recur,
		isException: !!inviteComponent?.ex,
		exceptId: inviteComponent?.exceptId,

		// Alarms/reminders
		alarm: !!inviteComponent?.alarm,
		alarmData: inviteComponent?.alarm,
		alarmString: getAlarmToString(inviteComponent?.alarm),
		alarmValue: getAlarmValueInMinutes(alarmTrigger),

		// Metadata and flags (parent is folder ID for sync data)
		parent: inviteComponent?.ciFolder,
		flags: inv.f,
		sequenceNumber: inviteComponent?.seq,
		uid: inviteComponent?.uid,
		url: inviteComponent?.url,
		noBlob: inviteComponent?.noBlob,
		ms: inv.ms || 0,
		rev: inv.rev || 0,
		meta: inv.meta,
		xprop: inviteComponent?.xprop,
		neverSent: !!inviteComponent?.neverSent,

		// Tags
		tagNamesList: inv.tn,
		tags: normalizeTags(inv.t),

		// Attachments
		parts: inv.mp ? normalizeMailPartMapFn(inv.mp) : [],
		attach: {
			mp: retrieveAttachmentsType(inv?.mp?.[0] ?? [], 'attachment', inv?.id)
		},
		attachmentFiles: findAttachments(inv.mp ?? [], [])
	};
};
