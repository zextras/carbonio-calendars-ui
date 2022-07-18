/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, merge } from 'lodash';
import moment from 'moment';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const addAppointmentEditorReducer = (state: any, { payload }: any): any => {
	state.editors[payload.id] = payload.appointment;
	if (payload.panel) {
		if (state.editorPanel !== payload.id) {
			// This discards any unsaved edits in the previous panel
			state.editors[state.editorPanel] = undefined;
		}
		state.editorPanel = payload.id;
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editAppointmentDataReducer = (state: any, { payload }: any): any => {
	const editor = cloneDeep(state.editors[payload.id]);
	state.editors[payload.id] = merge(state.editors[payload.id], payload.mod);
	state.editors[payload.id].resource = {
		...state.editors[payload.id].resource,
		draft: payload.mod?.resource?.draft,
		start:
			editor.allDay || !editor?.resource?.tz
				? {
						d: moment(editor.start).utc().format('YYYYMMDD[T]HHmmss[Z]')
				  }
				: {
						d: moment(editor.start).format('YYYYMMDD[T]HHmmss'),
						tz: editor?.resource?.tz
				  },
		end:
			editor.allDay || !editor?.resource?.tz
				? {
						d: moment(editor.end).utc().format('YYYYMMDD[T]HHmmss[Z]')
				  }
				: {
						d: moment(editor.start).format('YYYYMMDD[T]HHmmss'),
						tz: editor?.resource?.tz
				  }
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editResourceDataReducer = (state: any, { payload }: any): any => {
	state.editors[payload.id].resource = {
		...state.editors[payload.id].resource,
		...payload.mod
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editAttendeesReducer = (state: any, { payload }: any): any => {
	state.editors[payload.id].resource.attendees = payload.attendees;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editRoomReducer = (state: any, { payload }: any): any => {
	const { label, link, attendees } = payload.data;
	if (label && link) {
		state.editors[payload.id].resource.room = { label, link };
	} else {
		state.editors[payload.id].resource.room = undefined;
	}
	if (attendees) {
		state.editors[payload.id].resource.attendees = attendees;
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editOptionalAttendeesReducer = (state: any, { payload }: any): any => {
	state.editors[payload.id].resource.optionalAttendees = payload.optionalAttendees;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const openEditorReducer = (state: any, { payload }: any): any => {
	state.editors[payload.id] = undefined;
	if (payload.id === state.editorPanel) state.editorPanel = null;
};
