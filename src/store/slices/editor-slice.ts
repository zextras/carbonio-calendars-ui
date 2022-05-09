/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import { createAppointment } from '../actions/new-create-appointment';
import { createAppointmentFulfilled } from '../reducers/create-appointment';
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

export const editorSlice = createSlice({
	name: 'editor',
	initialState: {
		status: 'idle',
		editors: {},
		editorPanel: null
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
		initializeEditorAppointment: initializeAppointmentReducer
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
	editOptionalAttendees
} = editorSlice.actions;

export default editorSlice.reducer;
