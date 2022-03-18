/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import { initializeEditorAppointment } from '../actions/initialize-editor-appointment';
import { handleCreateAppointmentFulfilled } from '../reducers/create-appointment';
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
		openEditor: openEditorReducer
	},
	extraReducers: (builder) => {
		builder.addCase(initializeEditorAppointment.fulfilled, handleCreateAppointmentFulfilled);
	}
});

export const {
	addAppointmentEditor,
	editAppointmentData,
	editResourceData,
	openEditor,
	editRoom,
	editAttendees,
	editOptionalAttendees
} = editorSlice.actions;

export default editorSlice.reducer;
