/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEqual, omit, reduce } from 'lodash';

import { Editor } from '../types/editor';
import { EditorChipAttendees, InviteParticipant, InviteParticipants } from '../types/store/invite';

export const EDITOR_METADATA_FIELDS: ReadonlyArray<keyof Editor> = [
	'id',
	'isDirty',
	'disabled',
	'panel',
	'isNew',
	'originalStart',
	'originalEnd',
	'compNum',
	'inviteId',
	'uid',
	'ridZ',
	'exceptId',
	'isSeries',
	'isInstance',
	'isException',
	'searchPanel',
	'isProposeNewTime',
	'draft'
];

export const EDITOR_ATTENDEE_FIELDS: ReadonlyArray<keyof Editor> = [
	'attendees',
	'optionalAttendees'
];

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

export const haveNonAttendeeFieldsChanged = (
	current: Editor | undefined,
	original: Editor | undefined
): boolean => {
	if (!current || !original) {
		return true;
	}
	const excludedFields = [...EDITOR_METADATA_FIELDS, ...EDITOR_ATTENDEE_FIELDS];
	return !isEqual(omit(current, excludedFields), omit(original, excludedFields));
};

/**
 * Flattens the AC/NE/TE/DE response-status buckets returned by the invite normalizer
 * into a single list, preserving each participant's own response status.
 */
export const flattenInviteParticipants = (
	participants: InviteParticipants | undefined
): InviteParticipant[] =>
	reduce(
		participants,
		(acc, group) => (group ? [...acc, ...group] : acc),
		[] as InviteParticipant[]
	);

/**
 * Whether the logged-in user is one of the invite's participants, matched the same way
 * the rest of the event displayer matches "me" against an attendee (see organizer-part.tsx).
 */
export const isLoggedInUserAmongParticipants = (
	participants: InviteParticipant[],
	loggedInUser: { name?: string; displayName?: string }
): boolean =>
	participants.some(
		(participant) =>
			participant?.email === loggedInUser.name || participant?.name === loggedInUser.displayName
	);
