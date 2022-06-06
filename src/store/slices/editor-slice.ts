/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import { createAppointment } from '../actions/new-create-appointment';
import { createAppointmentFulfilled } from '../reducers/create-appointment';
import {
	editEditorAllDayReducer,
	editEditorAttendeesReducer,
	editEditorCalendarReducer,
	editEditorClassReducer,
	editEditorDisplayStatusReducer,
	editEditorOptionalAttendeesReducer,
	editEditorRoomReducer, editEditorTextReducer,
	editLocationReducer,
	editOrganizerReducer,
	editTitleReducer,
} from '../reducers/edit-organizer';
import { initializeAppointmentReducer } from '../reducers/initialize-appointment';
import {
	addAppointmentEditorReducer,
	closeEditorReducer,
	editAppointmentDataReducer,
	editAttendeesReducer,
	editOptionalAttendeesReducer,
	editResourceDataReducer,
	editRoomReducer,
	openEditorReducer
} from '../reducers/editor-reducers';
import { newEditorReducer } from '../reducers/new-editor';

export const editorSlice = createSlice({
	name: 'editor',
	initialState: {
		status: 'idle',
		editors: {},
		editorPanel: undefined
	},
	reducers: {
		addAppointmentEditor: addAppointmentEditorReducer,
		editAppointmentData: editAppointmentDataReducer,
		editResourceData: editResourceDataReducer,
		editAttendees: editAttendeesReducer,
		editRoom: editRoomReducer,
		editOptionalAttendees: editOptionalAttendeesReducer,
		closeEditor: closeEditorReducer,
		openEditor: openEditorReducer,
		initializeEditorAppointment: initializeAppointmentReducer,
		createNewEditor: newEditorReducer,
		editOrganizer: editOrganizerReducer,
		editEditorTitle: editTitleReducer,
		editEditorLocation: editLocationReducer,
		editEditorRoom: editEditorRoomReducer,
		editEditorAttendees: editEditorAttendeesReducer,
		editEditorOptionalAttendees: editEditorOptionalAttendeesReducer,
		editEditorDisplayStatus: editEditorDisplayStatusReducer,
		editEditorCalendar: editEditorCalendarReducer,
		editEditorClass: editEditorClassReducer,
		editEditorText: editEditorTextReducer,
		editEditorAllDay: editEditorAllDayReducer
	},
	extraReducers: (builder) => {
		builder.addCase(createAppointment.fulfilled, createAppointmentFulfilled);
	}
});

export const {
	initializeEditorAppointment,
	addAppointmentEditor,
	editAppointmentData,
	editResourceData,
	openEditor,
	editRoom,
	editAttendees,
	editOptionalAttendees,
	createNewEditor,
	editOrganizer,
	editEditorTitle,
	editEditorLocation,
	editEditorRoom,
	editEditorAttendees,
	editEditorOptionalAttendees,
	editEditorDisplayStatus,
	editEditorCalendar,
	editEditorClass,
	editEditorText,
	editEditorAllDay
} = editorSlice.actions;

export default editorSlice.reducer;
