/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EditorChipAttendees } from '../types/store/invite';

const toEmailSet = (attendees: EditorChipAttendees[] | undefined): Set<string> =>
	new Set((attendees ?? []).map((attendee) => attendee.email.toLowerCase()));

export const haveAttendeesChanged = (
	current: EditorChipAttendees[] | undefined,
	original: EditorChipAttendees[] | undefined
): boolean => {
	const currentEmails = toEmailSet(current);
	const originalEmails = toEmailSet(original);
	if (currentEmails.size !== originalEmails.size) {
		return true;
	}
	return Array.from(currentEmails).some((email) => !originalEmails.has(email));
};

export const getNewlyAddedAttendees = (
	current: EditorChipAttendees[] | undefined,
	original: EditorChipAttendees[] | undefined
): EditorChipAttendees[] => {
	const originalEmails = toEmailSet(original);
	return (current ?? []).filter((attendee) => !originalEmails.has(attendee.email.toLowerCase()));
};
