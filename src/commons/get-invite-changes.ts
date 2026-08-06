/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { format, isSameDay } from 'date-fns';
import { differenceBy, unionBy } from 'lodash';

import { getDateFnsLocale } from './date-fns-react-widgets-localizer';
import { Editor, Resource } from '../types/editor';
import { InviteChangeParticipant, InviteChanges } from '../types/invite-changes';
import { EditorChipAttendees } from '../types/store/invite';

const getDisplayName = (attendee: EditorChipAttendees): string | undefined =>
	attendee.fullName ??
	(attendee.firstName && attendee.lastName
		? `${attendee.firstName} ${attendee.lastName}`
		: attendee.label);

const toChangeParticipant = (attendee: EditorChipAttendees): InviteChangeParticipant => ({
	a: attendee.email.toLowerCase(),
	d: getDisplayName(attendee)
});

const getAllAttendees = (editor: Editor | undefined): EditorChipAttendees[] =>
	unionBy([...(editor?.attendees ?? []), ...(editor?.optionalAttendees ?? [])], (attendee) =>
		attendee.email.toLowerCase()
	);

const byLowerCaseEmail = (attendee: { email: string }): string => attendee.email.toLowerCase();

const toChangeResource = (resource: Resource): InviteChangeParticipant => ({
	a: resource.email.toLowerCase(),
	d: resource.label
});

const getResourceList = (resources: Resource[] | undefined): Resource[] =>
	(resources ?? []).filter((resource) => !!resource?.email);

const diffResourceList = (
	before: Resource[],
	after: Resource[]
): { added: InviteChangeParticipant[]; removed: InviteChangeParticipant[] } | undefined => {
	const added = differenceBy(after, before, byLowerCaseEmail);
	const removed = differenceBy(before, after, byLowerCaseEmail);
	return added.length > 0 || removed.length > 0
		? { added: added.map(toChangeResource), removed: removed.map(toChangeResource) }
		: undefined;
};

// A terse "EEE, MMM d · time – time" range, e.g. "Wed, Jul 29 · 8:30–9:00 PM".
// Kept separate from the app's other (Intl-based) date range formatter: this
// one is only ever baked into the invitation-changes diff text, so it favors
// a compact, always-short-weekday form over that formatter's fuller output.
export const formatCompactDateTimeRange = (start: number, end: number, allDay: boolean): string => {
	const locale = getDateFnsLocale();
	const startDate = new Date(start);
	const endDate = new Date(end);
	const formatDay = (date: Date): string => format(date, 'EEE, MMM d', { locale });

	if (allDay) {
		return isSameDay(startDate, endDate)
			? formatDay(startDate)
			: `${formatDay(startDate)} – ${formatDay(endDate)}`;
	}

	const formatTime = (date: Date): string => format(date, 'p', { locale });
	if (isSameDay(startDate, endDate)) {
		return `${formatDay(startDate)} · ${formatTime(startDate)}–${formatTime(endDate)}`;
	}
	return `${formatDay(startDate)} · ${formatTime(startDate)} – ${formatDay(endDate)} · ${formatTime(endDate)}`;
};

export const getInviteChanges = (
	original: Editor | undefined,
	current: Editor
): InviteChanges | undefined => {
	if (!original) {
		return undefined;
	}

	const changes: InviteChanges = {};

	const beforeTitle = original.title ?? '';
	const afterTitle = current.title ?? '';
	if (beforeTitle !== afterTitle) {
		changes.title = { before: beforeTitle, after: afterTitle };
	}

	const beforeLocation = original.location ?? '';
	const afterLocation = current.location ?? '';
	if (beforeLocation !== afterLocation) {
		changes.location = { before: beforeLocation, after: afterLocation };
	}

	const beforeRoomLink = original.room?.link ?? '';
	const afterRoomLink = current.room?.link ?? '';
	if (beforeRoomLink !== afterRoomLink) {
		changes.virtualRoom = { before: beforeRoomLink, after: afterRoomLink };
	}

	const meetingRoomsDiff = diffResourceList(
		getResourceList(original.meetingRoom),
		getResourceList(current.meetingRoom)
	);
	if (meetingRoomsDiff) {
		changes.meetingRooms = meetingRoomsDiff;
	}

	const equipmentDiff = diffResourceList(
		getResourceList(original.equipment),
		getResourceList(current.equipment)
	);
	if (equipmentDiff) {
		changes.equipment = equipmentDiff;
	}

	const beforeAttendees = getAllAttendees(original);
	const afterAttendees = getAllAttendees(current);
	const added = differenceBy(afterAttendees, beforeAttendees, byLowerCaseEmail);
	const removed = differenceBy(beforeAttendees, afterAttendees, byLowerCaseEmail);
	if (added.length > 0 || removed.length > 0) {
		changes.participants = {
			added: added.map(toChangeParticipant),
			removed: removed.map(toChangeParticipant)
		};
	}

	if (original.start !== current.start || original.end !== current.end) {
		changes.dateTime = {
			before: formatCompactDateTimeRange(original.start ?? 0, original.end ?? 0, !!original.allDay),
			after: formatCompactDateTimeRange(current.start ?? 0, current.end ?? 0, !!current.allDay)
		};
	}

	if (!!original.allDay !== !!current.allDay) {
		changes.allDay = { before: !!original.allDay, after: !!current.allDay };
	}

	const beforeMessage = original.plainText?.trim() ?? '';
	const afterMessage = current.plainText?.trim() ?? '';
	if (beforeMessage !== afterMessage) {
		changes.message = { before: beforeMessage, after: afterMessage };
	}

	return Object.keys(changes).length > 0 ? changes : undefined;
};
