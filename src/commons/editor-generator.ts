/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store, getUserAccount, getUserSettings } from '@zextras/carbonio-shell-ui';
import { find } from 'lodash';
import moment from 'moment';
import {
	closeEditor,
	createNewEditor,
	editEditorAllDay,
	editEditorAttendees,
	editEditorCalendar,
	editEditorClass,
	editEditorDate,
	editEditorDisplayStatus,
	editEditorLocation,
	editEditorOptionalAttendees,
	editEditorRecurrence,
	editEditorReminder,
	editEditorRoom,
	editEditorText,
	editEditorTimezone,
	editEditorTitle,
	editOrganizer
} from '../store/slices/editor-slice';
import { EditorCallbacks, IdentityItem, Room } from '../types/editor';
import { Calendar } from '../types/store/calendars';
import { Attendee, InviteClass } from '../types/store/invite';
import { getIdentityItems } from './get-identity-items';

export type Editor = {
	organizer?: any;
	title?: string;
	location?: string;
	room?: any;
	attendees?: any[];
	optionalAttendees?: any[];
	allDay?: boolean;
	freeBusy?: string;
	class?: string;
	start?: number;
	end?: number;
	inviteId?: string | undefined;
	timezone?: string | undefined;
	reminder?: string | undefined;
	recur?: any;
	id?: string;
};

let counter = 0;

const getNewEditId = (id: string): string => {
	counter += 1;
	return `${id}-${counter}`;
};

const createEmptyEditor = (id: string): Editor => {
	const identities = getIdentityItems();
	const { zimbraPrefTimeZoneId, zimbraPrefCalendarApptReminderWarningTime } =
		getUserSettings().prefs;
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
		timezone: zimbraPrefTimeZoneId as string,
		reminder: zimbraPrefCalendarApptReminderWarningTime as string,
		recur: undefined,
		id
	};
};

export const createCallbacks = (id: string): EditorCallbacks => {
	const { dispatch } = store.store;
	const account = getUserAccount();

	const onOrganizerChange = (
		organizer: IdentityItem
	): { payload: { id: string | undefined; organizer: IdentityItem }; type: string } =>
		dispatch(editOrganizer({ id, organizer }));

	const onSubjectChange = (
		title: string
	): { payload: { id: string | undefined; title: string }; type: string } =>
		dispatch(editEditorTitle({ id, title }));

	const onLocationChange = (
		location: string
	): { payload: { id: string | undefined; location: string }; type: string } =>
		dispatch(editEditorLocation({ id, location }));

	const onRoomChange = (
		room: Room
	): { payload: { id: string | undefined; room: Room }; type: string } =>
		dispatch(editEditorRoom({ id, room }));

	const onAttendeesChange = (
		attendees: Array<Attendee>
	): { payload: { id: string; attendees: Attendee[] }; type: string } =>
		dispatch(editEditorAttendees({ id, attendees }));

	const onOptionalAttendeesChange = (
		optionalAttendees: Array<Attendee>
	): { payload: { id: string; optionalAttendees: Attendee[] }; type: string } =>
		dispatch(editEditorOptionalAttendees({ id, optionalAttendees }));

	const onDisplayStatusChange = (
		freeBusy: string
	): { payload: { id: string; freeBusy: string }; type: string } =>
		dispatch(editEditorDisplayStatus({ id, freeBusy }));

	const onCalendarChange = (calendar: Calendar): void => {
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

	const onPrivateChange = (
		isPrivate: InviteClass
	): { payload: { id: string | undefined; class: InviteClass }; type: string } =>
		dispatch(
			editEditorClass({
				id,
				class: isPrivate
			})
		);

	const onDateChange = (
		mod: number
	): { payload: { id: string | undefined; mod: number }; type: string } =>
		dispatch(editEditorDate({ id, mod }));

	const onTextChange = ([plainText, richText]: [plainText: string, richText: string]): {
		payload: { id: string | undefined; richText: string; plainText: string };
	} => dispatch(editEditorText({ id, richText, plainText }));

	const onAllDayChange = (
		allDay: boolean,
		start?: number,
		end?: number
	): {
		payload: {
			id: string | undefined;
			allDay: boolean;
			start?: number | undefined;
			end?: number | undefined;
		};
		type: string;
	} => dispatch(editEditorAllDay({ id, allDay, start, end }));

	const onTimeZoneChange = (timezone: string): any =>
		dispatch(editEditorTimezone({ id, timezone }));

	const onReminderChange = (reminder: string): any =>
		dispatch(editEditorReminder({ id, reminder }));

	const onRecurrenceChange = (
		recur: any
	): { payload: undefined; type: string } | { payload: { id: string; recur: any }; type: string } =>
		dispatch(editEditorRecurrence({ id, recur }));

	const closeCurrentEditor = (): { payload: { id: string }; type: string } =>
		dispatch(closeEditor({ id }));

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
		onAllDayChange,
		onTimeZoneChange,
		onReminderChange,
		onRecurrenceChange,
		closeCurrentEditor
	};
};

export const generateEditor = (
	id: string,
	context = {},
	panel = true
): { editor: Editor; callbacks: EditorCallbacks } => {
	const editorId = getNewEditId(id);
	const emptyEditor = createEmptyEditor(editorId);
	const editor = { ...emptyEditor, ...context };
	const callbacks = createCallbacks(editorId);
	const { dispatch } = store.store;
	const storeEditorData = { ...editor, panel };
	dispatch(createNewEditor(storeEditorData));
	return { editor, callbacks };
};
