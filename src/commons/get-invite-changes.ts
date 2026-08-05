/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { differenceBy, unionBy } from 'lodash';

import { getTimeStrings } from '../hooks/use-get-date-range-converted-to-timezone';
import { Editor } from '../types/editor';
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

const byLowerCaseEmail = (attendee: EditorChipAttendees): string => attendee.email.toLowerCase();

export const getInviteChanges = (
	original: Editor | undefined,
	current: Editor
): InviteChanges | undefined => {
	if (!original) {
		return undefined;
	}

	const changes: InviteChanges = {};

	const beforeMessage = original.plainText?.trim() ?? '';
	const afterMessage = current.plainText?.trim() ?? '';
	if (beforeMessage !== afterMessage) {
		changes.message = { before: beforeMessage, after: afterMessage };
	}

	if (original.start !== current.start || original.end !== current.end) {
		changes.dateTime = {
			before: getTimeStrings({ start: original.start ?? 0, end: original.end ?? 0, options: {} }),
			after: getTimeStrings({ start: current.start ?? 0, end: current.end ?? 0, options: {} })
		};
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

	return Object.keys(changes).length > 0 ? changes : undefined;
};
