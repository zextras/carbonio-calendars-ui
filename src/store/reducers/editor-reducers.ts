/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import { isEqual, isNil, omit, union } from 'lodash';

import { CalendarEditor, Resource, Editor, Room, CalendarSender } from '../../types/editor';
import { EditorChipAttendees, InviteClass, InviteFreeBusy } from '../../types/store/invite';
import type { EditorSlice } from '../../types/store/store';

const METADATA_FIELDS: ReadonlyArray<keyof Editor> = [
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

const ATTENDEE_FIELDS: ReadonlyArray<keyof Editor> = ['attendees', 'optionalAttendees'];

const getAttendeeEmails = (attendees: Editor['attendees']): string[] =>
	(attendees ?? []).map((a) => a.email.toLowerCase()).sort((a, b) => a.localeCompare(b));

const recomputeIsDirty = (
	editors: EditorSlice['editors'],
	originalEditors: EditorSlice['originalEditors'],
	id: string
): void => {
	const original = originalEditors[id];
	if (!original) {
		// eslint-disable-next-line no-param-reassign
		editors[id].isDirty = true;
		return;
	}
	const excludedFields = [...METADATA_FIELDS, ...ATTENDEE_FIELDS];
	const nonAttendeeChanged = !isEqual(
		omit(editors[id], excludedFields),
		omit(original, excludedFields)
	);
	const attendeesChanged = !isEqual(
		getAttendeeEmails(editors[id].attendees),
		getAttendeeEmails(original.attendees)
	);
	const optionalAttendeesChanged = !isEqual(
		getAttendeeEmails(editors[id].optionalAttendees),
		getAttendeeEmails(original.optionalAttendees)
	);
	// eslint-disable-next-line no-param-reassign
	editors[id].isDirty = nonAttendeeChanged || attendeesChanged || optionalAttendeesChanged;
};

type SenderPayload = {
	id: string | undefined;
	sender: CalendarSender;
};

type TitlePayload = {
	id: string | undefined;
	title: string;
};

type LocationPayload = {
	id: string | undefined;
	location: string;
};

type RoomPayload = {
	id: string | undefined;
	room: Room;
};

type CalendarPayload = {
	id: string;
	calendar: CalendarEditor;
};

type ClassPayload = {
	id: string | undefined;
	class: InviteClass;
};

type TextPayload = {
	id: string | undefined;
	richText: string;
	plainText: string;
};

type AllDayPayload = {
	id: string | undefined;
	allDay: boolean;
};

type AttendeePayload = { id: string; attendees: EditorChipAttendees[] };

type OptionalAttendeePayload = {
	id: string;
	optionalAttendees: EditorChipAttendees[];
};

type FreeBusyPayload = {
	id: string;
	freeBusy: InviteFreeBusy;
};

type DateReducer = {
	id: string;
	start: number;
	end: number;
};

type IsRichTextPayload = {
	id: string;
	isRichText: boolean;
};

type AttachmentFilesPayload = {
	id: string;
	attach: any;
	attachmentFiles: any[];
};

export const newEditorReducer = (state: EditorSlice, action: PayloadAction<Editor>): void => {
	if (action.payload) {
		const editor = { ...action.payload, isDirty: false };
		state.editors[action.payload.id] = editor;
		state.originalEditors[action.payload.id] = editor;
	}
};

export const editIsRichTextReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<IsRichTextPayload>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.isRichText)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].isRichText = payload.isRichText;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorAttachmentsReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<AttachmentFilesPayload>
): void => {
	if (!payload?.id || !editors?.[payload.id]) return;
	const editor = editors[payload.id];
	editor.attachmentFiles = payload.attachmentFiles ?? [];
	editor.attach = {
		...editor.attach,
		aid: (payload.attachmentFiles ?? []).filter((f) => f.aid).map((f) => f.aid) as string[],
		mp: payload.attach?.mp ?? editor.attach?.mp ?? []
	};
	recomputeIsDirty(editors, originalEditors, payload.id);
};

export const editSenderReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<SenderPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]?.sender && payload?.sender) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].sender = payload.sender;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editTitleReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<TitlePayload>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.title) && !isNil(payload?.title)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].title = payload.title;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editLocationReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<LocationPayload>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.location) && !isNil(payload?.location)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].location = payload.location;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorMeetingRoomReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<{ id: string; meetingRoom: Array<Resource> }>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id])) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].meetingRoom = payload.meetingRoom;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorEquipmentReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<{ id: string; equipment: Array<Resource> }>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id])) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].equipment = payload.equipment;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorRoomReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<RoomPayload>
): void => {
	const { label, link, attendees } = payload.room;
	if (payload?.id) {
		if (label && link) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].room = { label, link };
		} else {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].room = undefined;
		}
		if (attendees) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].attendees = union(editors[payload.id].attendees, attendees);
		}
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorAttendeesReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<AttendeePayload>
): void => {
	// eslint-disable-next-line no-param-reassign
	editors[payload.id].attendees = payload.attendees;
	recomputeIsDirty(editors, originalEditors, payload.id);
};

export const editEditorOptionalAttendeesReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<OptionalAttendeePayload>
): void => {
	// eslint-disable-next-line no-param-reassign
	editors[payload.id].optionalAttendees = payload.optionalAttendees;
	recomputeIsDirty(editors, originalEditors, payload.id);
};

export const editEditorDisplayStatusReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<FreeBusyPayload>
): void => {
	if (editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].freeBusy = payload.freeBusy;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorCalendarReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<CalendarPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].calendar = payload.calendar;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorClassReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<ClassPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].class = payload.class;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorDateReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<DateReducer>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].start = payload.start;
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].end = payload.end;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorTextReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<TextPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].richText = payload.richText;
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].plainText = payload.plainText;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorAllDayReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<AllDayPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].allDay = payload.allDay;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorTimezoneReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<any>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].timezone = payload.timezone;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorReminderReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<any>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].reminder = payload.reminder;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const editEditorRecurrenceReducer = (
	{ editors, originalEditors }: EditorSlice,
	{ payload }: PayloadAction<any>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].recur = payload.recur;
		recomputeIsDirty(editors, originalEditors, payload.id);
	}
};

export const updateEditorReducer = (
	state: EditorSlice,
	{ payload }: PayloadAction<{ id: string; editor: Editor }>
): void => {
	if (payload?.id && state?.editors?.[payload?.id]) {
		const saved = { ...state.editors[payload.id], ...payload.editor, isDirty: false };
		// eslint-disable-next-line no-param-reassign
		state.editors[payload.id] = saved;
		// eslint-disable-next-line no-param-reassign
		state.originalEditors[payload.id] = saved;
	}
};
