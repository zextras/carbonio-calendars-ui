/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store, getUserAccount } from '@zextras/carbonio-shell-ui';
import { find } from 'lodash';
import moment from 'moment';
import {
	createNewEditor,
	editAppointmentData,
	editEditorAllDay,
	editEditorAttendees,
	editEditorCalendar,
	editEditorClass,
	editEditorDisplayStatus,
	editEditorLocation,
	editEditorOptionalAttendees,
	editEditorRoom,
	editEditorText,
	editEditorTitle,
	editOrganizer
} from '../store/slices/editor-slice';
import { EditorCallbacks } from '../types/editor';
import { getIdentityItems } from './get-identity-items';

type Editor = {
	organizer: any;
	title: string;
	location: string;
	room: any;
	attendees: any[];
	optionalAttendees: any[];
	allDay: boolean;
	freeBusy: string;
	class: string;
	start: number;
	end: number;
	inviteId: string | undefined;
	id: string;
};

let counter = 0;

const getNewEditId = (id: string): string => {
	counter += 1;
	return `${id}-${counter}`;
};

const createEmptyEditor = (id: string): Editor => {
	const identities = getIdentityItems();
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);

	return {
		organizer: defaultOrganizer,
		title: '',
		location: '',
		room: undefined,
		attendees: [],
		optionalAttendees: [],
		allDay: false,
		freeBusy: 'B',
		class: 'PUB',
		start: moment().valueOf(),
		end: moment().valueOf() + 3600,
		inviteId: undefined,
		id
	};
};

export const createCallbacks = (id: string): EditorCallbacks => {
	const { dispatch } = store.store;
	const account = getUserAccount();

	const onOrganizerChange = (data) => dispatch(editOrganizer({ id, organizer: data }));

	const onSubjectChange = (data) => dispatch(editEditorTitle({ id, title: data.target.value }));

	const onLocationChange = (data) =>
		dispatch(editEditorLocation({ id, location: data.target.value }));

	const onRoomChange = (room) => dispatch(editEditorRoom({ id, room }));

	const onAttendeesChange = (attendees) => dispatch(editEditorAttendees({ id, attendees }));

	const onOptionalAttendeesChange = (optionalAttendees) =>
		dispatch(editEditorOptionalAttendees({ id, optionalAttendees }));

	const onDisplayStatusChange = (freeBusy) => dispatch(editEditorDisplayStatus({ id, freeBusy }));

	const onCalendarChange = (calendar) => {
		const calResource = {
			id: calendar.id,
			name: calendar.name,
			color: calendar.color
		};
		const organizer = {
			email: calendar.owner,
			name: '',
			sentBy: account.name
		};
		const data = {
			id,
			calendar: calResource,
			organizer: calendar.isShared ? organizer : undefined
		};
		dispatch(editEditorCalendar(data));
	};

	const onPrivateChange = (isPrivate) =>
		dispatch(
			editEditorClass({
				id,
				class: isPrivate ? 'PRI' : 'PUB'
			})
		);

	const onDateChange = (mod) => dispatch(editAppointmentData({ id, mod }));

	const onTextChange = ([plainText, richText]) =>
		dispatch(editEditorText({ id, richText, plainText }));

	const onAllDayChange = (allDay, start, end) =>
		dispatch(editEditorAllDay({ id, allDay, start, end }));

	return {
		onOrganizerChange,
		onSubjectChange,
		onLocationChange,
		onRoomChange,
		onAttendeesChange,
		onOptionalAttendeesChange,
		onDisplayStatusChange,
		onCalendarChange,
		onPrivateChange,
		onDateChange,
		onTextChange,
		onAllDayChange
	};
};

export const generateEditor = (id: string, context = {}, panel = true): any => {
	const editorId = getNewEditId(id);
	const emptyEditor = createEmptyEditor(editorId);
	const editor = { ...emptyEditor, ...context };
	const callbacks = createCallbacks(editorId);
	const { dispatch } = store.store;
	const storeEditorData = { ...editor, panel };
	dispatch(createNewEditor(storeEditorData));
	return { editor, callbacks };
};
