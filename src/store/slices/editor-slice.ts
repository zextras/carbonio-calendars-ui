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
	editTitleReducer,
	editIsRichTextReducer,
	editEditorAttachmentsReducer,
	updateEditorReducer,
	newEditorReducer,
	editSenderReducer,
	editEditorMeetingRoomReducer,
	editEditorEquipmentReducer,
	setPendingCloseConfirmationReducer,
	clearPendingCloseConfirmationReducer
} from '../reducers/editor-reducers';

const initialState: EditorSlice = {
	status: 'idle',
	editors: {},
	originalEditors: {},
	pendingCloseConfirmation: null
};

export const editorSlice = createSlice({
	name: 'editor',
	initialState,
	reducers: {
		createNewEditor: newEditorReducer,
		editIsRichText: editIsRichTextReducer,
		editEditorAttachments: editEditorAttachmentsReducer,
		editSender: editSenderReducer,
		editEditorTitle: editTitleReducer,
		editEditorLocation: editLocationReducer,
		editEditorRoom: editEditorRoomReducer,
		editEditorAttendees: editEditorAttendeesReducer,
		editEditorOptionalAttendees: editEditorOptionalAttendeesReducer,
		editEditorDisplayStatus: editEditorDisplayStatusReducer,
		editEditorCalendar: editEditorCalendarReducer,
		editEditorClass: editEditorClassReducer,
		editEditorDate: editEditorDateReducer,
		editEditorMeetingRoom: editEditorMeetingRoomReducer,
		editEditorEquipment: editEditorEquipmentReducer,
		editEditorText: editEditorTextReducer,
		editEditorAllDay: editEditorAllDayReducer,
		editEditorTimezone: editEditorTimezoneReducer,
		editEditorReminder: editEditorReminderReducer,
		editEditorRecurrence: editEditorRecurrenceReducer,
		updateEditor: updateEditorReducer,
		setPendingCloseConfirmation: setPendingCloseConfirmationReducer,
		clearPendingCloseConfirmation: clearPendingCloseConfirmationReducer
	}
});

export const {
	createNewEditor,
	editIsRichText,
	editEditorAttachments,
	editSender,
	editEditorTitle,
	editEditorLocation,
	editEditorRoom,
	editEditorMeetingRoom,
	editEditorEquipment,
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
	updateEditor,
	setPendingCloseConfirmation,
	clearPendingCloseConfirmation
} = editorSlice.actions;

export default editorSlice.reducer;
