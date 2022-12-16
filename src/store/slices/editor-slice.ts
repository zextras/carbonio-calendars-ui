/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import { EditorSlice } from '../../types/store/store';
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
	deleteEditorReducer
} from '../reducers/edit-organizer';
import {
	editAppointmentDataReducer,
	editAttendeesReducer,
	editOptionalAttendeesReducer,
	editResourceDataReducer,
	editRoomReducer,
	openEditorReducer
} from '../reducers/editor-reducers';
import { newEditorReducer } from '../reducers/new-editor';
import { Editor } from '../../types/editor';

const initialState: EditorSlice = {
	status: 'idle',
	editors: {} as Record<string, Editor>,
	editorPanel: undefined,
	activeId: undefined,
	searchActiveId: undefined
};
export const editorSlice = createSlice({
	name: 'editor',
	initialState,
	reducers: {
		editAppointmentData: editAppointmentDataReducer,
		editResourceData: editResourceDataReducer,
		editAttendees: editAttendeesReducer,
		editRoom: editRoomReducer,
		editOptionalAttendees: editOptionalAttendeesReducer,
		openEditor: openEditorReducer,
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
		deleteEditor: deleteEditorReducer,
		updateEditor: updateEditorReducer
	}
});

export const {
	editAppointmentData,
	openEditor,
	editRoom,
	editAttendees,
	editOptionalAttendees,
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
	deleteEditor,
	updateEditor
} = editorSlice.actions;

export default editorSlice.reducer;
