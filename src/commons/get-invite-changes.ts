/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { differenceBy, unionBy } from 'lodash';

import { getTimeStrings } from '../hooks/use-get-date-range-converted-to-timezone';
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

const getAllResources = (editor: Editor | undefined): Resource[] =>
	unionBy(
		[...(editor?.meetingRoom ?? []), ...(editor?.equipment ?? [])].filter(
			(resource) => !!resource?.email
		),
		byLowerCaseEmail
	);

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

	const beforeResources = getAllResources(original);
	const afterResources = getAllResources(current);
	const addedResources = differenceBy(afterResources, beforeResources, byLowerCaseEmail);
	const removedResources = differenceBy(beforeResources, afterResources, byLowerCaseEmail);
	if (addedResources.length > 0 || removedResources.length > 0) {
		changes.resources = {
			added: addedResources.map(toChangeResource),
			removed: removedResources.map(toChangeResource)
		};
	}

	const beforeRoomLink = original.room?.link ?? '';
	const afterRoomLink = current.room?.link ?? '';
	if (beforeRoomLink !== afterRoomLink) {
		changes.virtualRoom = { before: beforeRoomLink, after: afterRoomLink };
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
			before: getTimeStrings({ start: original.start ?? 0, end: original.end ?? 0, options: {} }),
			after: getTimeStrings({ start: current.start ?? 0, end: current.end ?? 0, options: {} })
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
