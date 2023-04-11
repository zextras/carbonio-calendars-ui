/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import { isNil, union } from 'lodash';
import type { Editor, IdentityItem, Room } from '../../types/editor';
import type { EventResourceCalendar } from '../../types/event';
import type { Attendee, InviteClass, InviteFreeBusy } from '../../types/store/invite';
import type { EditorSlice } from '../../types/store/store';

type OrganizerPayload = {
	id: string | undefined;
	organizer: IdentityItem;
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
	calendar: EventResourceCalendar;
	organizer: { email: string; name: string; sentBy: string } | undefined;
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
	start?: number;
	end?: number;
};

type AttendeePayload = { id: string; attendees: Attendee[] };

type OptionalAttendeePayload = {
	id: string;
	optionalAttendees: Attendee[];
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
		state.editors[action.payload.id] = action.payload;
		if (action.payload.panel) {
			state.activeId = action.payload.id;
		}
		if (action.payload.searchPanel) {
			state.searchActiveId = action.payload.id;
		}
	}
};

export const editIsRichTextReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<IsRichTextPayload>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.isRichText)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].isRichText = payload.isRichText;
	}
};

export const editEditorAttachmentsReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<AttachmentFilesPayload>
): void => {
	if (payload?.id) {
		if (editors?.[payload?.id]) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].attachmentFiles = payload.attachmentFiles;
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].attach = {
				...payload.attach,
				aid: union(editors[payload.id]?.attach?.aid ?? [], payload?.attach?.aid ?? [])
			};
		}
	}
};
export const editOrganizerReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<OrganizerPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]?.organizer && payload?.organizer) {
		const editor = editors[payload.id];
		editor.organizer = payload.organizer;
	}
};

export const editTitleReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<TitlePayload>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.title) && !isNil(payload?.title)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].title = payload.title;
	}
};

export const editLocationReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<LocationPayload>
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.location) && !isNil(payload?.location)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].location = payload.location;
	}
};

export const editEditorRoomReducer = (
	{ editors }: EditorSlice,
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
	}
};

export const editEditorAttendeesReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<AttendeePayload>
): void => {
	// eslint-disable-next-line no-param-reassign
	editors[payload.id].attendees = payload.attendees;
};

export const editEditorOptionalAttendeesReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<OptionalAttendeePayload>
): void => {
	// eslint-disable-next-line no-param-reassign
	editors[payload.id].optionalAttendees = payload.optionalAttendees;
};

export const editEditorDisplayStatusReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<FreeBusyPayload>
): void => {
	if (editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].freeBusy = payload.freeBusy;
	}
};

export const editEditorCalendarReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<CalendarPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].calendar = payload.calendar;
		if (payload.organizer) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].organizer = payload.organizer;
		}
	}
};

export const editEditorClassReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<ClassPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].class = payload.class;
	}
};

export const editEditorDateReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<DateReducer>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].start = payload.start;
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].end = payload.end;
	}
};

export const editEditorTextReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<TextPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].richText = payload.richText;
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].plainText = payload.plainText;
	}
};

export const editEditorAllDayReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<AllDayPayload>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].allDay = payload.allDay;
		if (payload.start) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].start = payload.start;
		}
		if (payload.end) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].end = payload.end;
		}
	}
};

export const editEditorTimezoneReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<any>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].timezone = payload.timezone;
	}
};

export const editEditorReminderReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<any>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].reminder = payload.reminder;
	}
};

export const editEditorRecurrenceReducer = (
	{ editors }: EditorSlice,
	{ payload }: PayloadAction<any>
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].recur = payload.recur;
	}
};

export const updateEditorReducer = (
	editor: EditorSlice,
	{ payload }: PayloadAction<{ id: string; editor: Editor }>
): void => {
	if (payload?.id && editor?.editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editor.editors[payload.id] = { ...editor.editors[payload.id], ...payload.editor };
	}
};
