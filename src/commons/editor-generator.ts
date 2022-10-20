/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount, getUserSettings } from '@zextras/carbonio-shell-ui';
import { find, isEmpty, isNaN, omit, startsWith } from 'lodash';
import moment from 'moment';
import { PREFS_DEFAULTS } from '../constants';
import { EventPropType, normalizeEditor } from '../normalizations/normalize-editor';
import { createAppointment } from '../store/actions/new-create-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
import { store } from '../store/redux';
import {
	createNewEditor,
	editEditorAllDay,
	editEditorAttachments,
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
	editIsRichText,
	editOrganizer,
	updateEditor
} from '../store/slices/editor-slice';
import { Editor, EditorCallbacks, IdentityItem, Room } from '../types/editor';
import { EventResourceCalendar } from '../types/event';
import { Attendee, Invite, InviteClass, InviteFreeBusy } from '../types/store/invite';
import { getIdentityItems } from './get-identity-items';

let counter = 0;

const getNewEditId = (id?: string): string => {
	counter += 1;
	return `${id ?? 'new'}-${counter}`;
};

export const getEndTime = ({ start, duration }: { start: number; duration: string }): number => {
	const now = moment(start);
	if (duration?.includes('m')) {
		const interval = parseInt(duration, 10) * 60;
		const value = now.add(interval, 's').valueOf();
		return isNaN(value) ? now.valueOf() + 3600 : value;
	}
	const interval = parseInt(duration, 10);
	const value = now.add(interval, 's').valueOf();
	return isNaN(value) ? now.valueOf() + 3600 : value;
};

const createEmptyEditor = (id: string): Editor => {
	const identities = getIdentityItems();
	const {
		zimbraPrefTimeZoneId,
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime,
		zimbraPrefDefaultCalendarId = PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	} = getUserSettings().prefs;
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);
	const calendars = store?.getState().calendars;

	return {
		attach: undefined,
		calendar: calendars?.calendars?.[zimbraPrefDefaultCalendarId],
		panel: false,
		isException: false,
		exceptId: undefined,
		isSeries: false,
		isInstance: true,
		isRichText: true,
		isNew: startsWith(id, 'new'),
		attachmentFiles: [],
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
		end: getEndTime({
			start: moment().valueOf(),
			duration: zimbraPrefCalendarDefaultApptDuration as string
		}),
		inviteId: undefined,
		timezone: zimbraPrefTimeZoneId as string,
		reminder: zimbraPrefCalendarApptReminderWarningTime as string,
		recur: undefined,
		richText: '',
		plainText: '',
		disabled: {
			richTextButton: false,
			attachmentsButton: false,
			saveButton: false,
			sendButton: false,
			organizer: false,
			title: false,
			location: false,
			virtualRoom: false,
			attendees: false,
			optionalAttendees: false,
			freeBusySelector: false,
			calendarSelector: false,
			private: false,
			datePicker: false,
			timezone: false,
			allDay: false,
			reminder: false,
			recurrence: false,
			attachments: false,
			composer: false
		},
		id
	};
};

export const applyContextToEditor = ({
	editor,
	context
}: {
	editor: Editor;
	context: any;
}): Editor => {
	let newEditor = createEmptyEditor(editor.id);
	const contextObj = omit(context, 'disabled');
	if (!isEmpty(context)) {
		newEditor = { ...newEditor, ...editor, ...contextObj };
	}
	if (!isEmpty(context?.disabled)) {
		newEditor = {
			...newEditor,
			disabled: {
				...newEditor.disabled,
				...context.disabled
			}
		};
	}
	return newEditor;
};

export const createCallbacks = (id: string): EditorCallbacks => {
	const { dispatch } = store;
	const account = getUserAccount();

	const onToggleRichText = (isRichText: boolean): void => {
		dispatch(editIsRichText({ id, isRichText }));
	};

	const onAttachmentsChange = (
		attach: any,
		attachmentFiles: any[]
	): { payload: { id: string; attach: any; attachmentFiles: any[] }; type: string } =>
		dispatch(
			editEditorAttachments({
				id,
				attach,
				attachmentFiles
			})
		);

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
		freeBusy: InviteFreeBusy
	): { payload: { id: string; freeBusy: InviteFreeBusy }; type: string } =>
		dispatch(editEditorDisplayStatus({ id, freeBusy }));

	const onCalendarChange = (calendar: EventResourceCalendar): void => {
		const calResource = {
			id: calendar.id,
			name: calendar.name,
			color: calendar.color
		};
		const organizer = {
			email: calendar.owner ?? '',
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

	const onDateChange = ({
		start,
		end
	}: {
		start: number;
		end: number;
	}): { payload: { id: string | undefined; start: number; end: number }; type: string } =>
		dispatch(editEditorDate({ id, start, end }));

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

	const onSave = ({
		draft = true,
		isNew = true
	}): any => // eslint-disable-next-line @typescript-eslint/ban-ts-comment
		isNew // @ts-ignore
			? dispatch(createAppointment({ id, draft })).then(({ payload }) => {
					const { response, editor } = payload;
					if (payload?.response) {
						dispatch(updateEditor({ id, editor }));
					}
					return Promise.resolve({ response, editor }); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
			  }) // @ts-ignore
			: dispatch(modifyAppointment({ id, draft })).then(({ payload }) => {
					const { response, editor, error } = payload;
					if (response && !error) {
						dispatch(updateEditor({ id, editor }));
						return Promise.resolve({ response, editor });
					}
					return Promise.resolve(payload);
			  });

	const onSend = (isNew: boolean): Promise<any> => onSave({ draft: false, isNew });

	return {
		onToggleRichText,
		onAttachmentsChange,
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
		onSave,
		onSend
	};
};

const setEditorDate = ({
	editor,
	invite,
	event
}: {
	editor: Editor;
	invite: Invite | undefined;
	event: EventPropType | undefined;
}): Editor => {
	if (editor.isSeries && !editor.isInstance && !editor.isException) {
		return {
			...editor,
			start: event?.allDay
				? moment(invite?.start?.u)?.startOf('date').valueOf()
				: moment(invite?.start?.u).valueOf(),
			end: event?.allDay
				? moment(invite?.end?.u)?.endOf('date').valueOf()
				: moment(invite?.end?.u).valueOf()
		};
	}
	return {
		...editor,
		start: event?.allDay
			? moment(event?.start)?.startOf('date').valueOf()
			: moment(event?.start).valueOf(),
		end: event?.allDay ? moment(event?.end)?.endOf('date').valueOf() : moment(event?.end).valueOf()
	};
};

export const generateEditor = ({
	event,
	invite,
	context
}: {
	event?: EventPropType;
	invite?: Invite;
	context: any;
}): { editor: Editor; callbacks: EditorCallbacks } => {
	const id = getNewEditId(event?.resource?.id);
	const isInstance = context?.isInstance;
	const compiledEditor = normalizeEditor({ invite, event, id, isInstance });
	const editorWithDates = setEditorDate({ editor: compiledEditor, event, invite });
	const editorWithContext = applyContextToEditor({
		editor: editorWithDates,
		context
	});
	const callbacks = createCallbacks(id);
	const { dispatch, getState } = store;
	dispatch(createNewEditor(editorWithContext));
	return {
		editor: getState()?.editor?.editors?.[id],
		callbacks
	};
};
