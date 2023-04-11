/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import type { EditorSlice } from '../../types/store/store';
import {
	editEditorAllDayReducer,
	editEditorAttendeesReducer,
	editEditorCalendarReducer,
	editEditorClassReducer,
	editEditorDateReducer,
	editEditorDisplayStatusReducer,
	editEditorOptionalAttendeesReducer,
	editEditorRecurrenceReducer,
	editEditorReminderReducer,
	editEditorRoomReducer,
	editEditorTextReducer,
	editEditorTimezoneReducer,
	editLocationReducer,
	editOrganizerReducer,
	editTitleReducer,
	editIsRichTextReducer,
	editEditorAttachmentsReducer,
	updateEditorReducer,
	newEditorReducer
} from '../reducers/editor-reducers';

const initialState: EditorSlice = {
	status: 'idle',
	editors: {},
	editorPanel: undefined,
	activeId: undefined,
	searchActiveId: undefined
};

export const editorSlice = createSlice({
	name: 'editor',
	initialState,
	reducers: {
		createNewEditor: newEditorReducer,
		editIsRichText: editIsRichTextReducer,
		editEditorAttachments: editEditorAttachmentsReducer,
		editOrganizer: editOrganizerReducer,
		editEditorTitle: editTitleReducer,
		editEditorLocation: editLocationReducer,
		editEditorRoom: editEditorRoomReducer,
		editEditorAttendees: editEditorAttendeesReducer,
		editEditorOptionalAttendees: editEditorOptionalAttendeesReducer,
		editEditorDisplayStatus: editEditorDisplayStatusReducer,
		editEditorCalendar: editEditorCalendarReducer,
		editEditorClass: editEditorClassReducer,
		editEditorDate: editEditorDateReducer,
		editEditorText: editEditorTextReducer,
		editEditorAllDay: editEditorAllDayReducer,
		editEditorTimezone: editEditorTimezoneReducer,
		editEditorReminder: editEditorReminderReducer,
		editEditorRecurrence: editEditorRecurrenceReducer,
		updateEditor: updateEditorReducer
	}
});

export const {
	createNewEditor,
	editIsRichText,
	editEditorAttachments,
	editOrganizer,
	editEditorTitle,
	editEditorLocation,
	editEditorRoom,
	editEditorAttendees,
	editEditorOptionalAttendees,
	editEditorDisplayStatus,
	editEditorCalendar,
	editEditorClass,
	editEditorDate,
	editEditorText,
	editEditorAllDay,
	editEditorTimezone,
	editEditorReminder,
	editEditorRecurrence,
	updateEditor
} = editorSlice.actions;

export default editorSlice.reducer;
