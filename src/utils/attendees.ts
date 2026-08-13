/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEqual, omit } from 'lodash';

import { Editor } from '../types/editor';
import { EditorChipAttendees } from '../types/store/invite';

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
