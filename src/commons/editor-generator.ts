/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, getUserAccount, LinkFolder } from '@zextras/carbonio-shell-ui';
import { find, isEmpty, isNaN, omit, startsWith } from 'lodash';
import moment from 'moment';
import { Dispatch } from 'redux';
import { setCalendarColor } from '../normalizations/normalizations-utils';
import { proposeNewTime } from '../store/actions/propose-new-time';
import { PREFS_DEFAULTS } from '../constants';
import { EventPropType, normalizeEditor } from '../normalizations/normalize-editor';
import { createAppointment } from '../store/actions/new-create-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
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
	editEditorRecurrenceFrequency, editEditorRecurrenceInterval,
	editEditorReminder,
	editEditorRoom,
	editEditorText,
	editEditorTimezone,
	editEditorTitle,
	editIsRichText,
	editOrganizer,
	updateEditor,
} from '../store/slices/editor-slice';
import { Editor, EditorCallbacks, IdentityItem, Room } from '../types/editor';
import { EventResourceCalendar } from '../types/event';
import { Attendee, Invite, InviteClass, InviteFreeBusy } from '../types/store/invite';
import { getPrefs } from '../carbonio-ui-commons/utils/get-prefs';
import { getIdentityItems } from './get-identity-items';
import { ZIMBRA_STANDARD_COLORS } from './zimbra-standard-colors';

let counter = 0;

export const getNewEditId = (id?: string): string => {
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

export const disabledFields = {
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
};

export const createEmptyEditor = (id: string, folders: Array<Folder>): Editor => {
	const identities = getIdentityItems();
	const {
		zimbraPrefTimeZoneId,
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime
	} = getPrefs();
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);
	const defaultCalendar = find(folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);
	return {
		attach: undefined,
		calendar: defaultCalendar
			? {
					id: defaultCalendar.id,
					name: defaultCalendar.name, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					color: defaultCalendar.color // @ts-ignore
						? ZIMBRA_STANDARD_COLORS[defaultCalendar.color]
						: setCalendarColor(defaultCalendar),
					owner: (defaultCalendar as LinkFolder)?.owner
			  }
			: undefined,
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
		disabled: disabledFields,
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
	const contextObj = omit(context, ['disabled', 'folders', 'dispatch']);
	let editorWithContext = { ...editor };
	if (!isEmpty(context)) {
		editorWithContext = { ...editorWithContext, ...contextObj };
	}
	if (!isEmpty(context?.disabled)) {
		editorWithContext = {
			...editorWithContext,
			disabled: {
				...editorWithContext.disabled,
				...context.disabled
			}
		};
	}
	return editorWithContext;
};

export const createCallbacks = (
	id: string,
	context: { isProposeNewTime?: boolean; dispatch: Dispatch }
): EditorCallbacks => {
	const account = getUserAccount();
	const { dispatch } = context;

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
		if (calendar) {
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
		}
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

	const onRecurrenceFrequencyChange = (
		freq: string
	):
		| { payload: undefined; type: string }
		| { payload: { id: string; freq: string }; type: string } =>
		dispatch(editEditorRecurrenceFrequency({ id, freq }));

	const onEditorRecurrenceIntervalChange = (
		ival: number
	):
		| { payload: undefined; type: string }
		| { payload: { id: string; ival: number }; type: string } =>
		dispatch(editEditorRecurrenceInterval({ id, ival }));

	const createAppointmentFn = (draft: boolean, editor: Editor): Promise<any> =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(createAppointment({ draft, editor })).then(({ payload }) => {
			const { response } = payload;
			if (payload?.response) {
				dispatch(updateEditor({ id, editor: payload.editor }));
			}
			return Promise.resolve({ response, editor: payload.editor });
		});

	const modifyAppointmentFn = (draft: boolean, editor: Editor): Promise<any> =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(modifyAppointment({ draft, editor })).then(({ payload }) => {
			const { response, error } = payload;
			if (response && !error) {
				dispatch(updateEditor({ id, editor: payload.editor }));
				return Promise.resolve({ response, editor: payload.editor });
			}
			return Promise.resolve(payload);
		});

	const onProposeNewTime = (): Promise<any> =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(proposeNewTime({ id })).then(({ payload }) => {
			const { response, editor, error } = payload;
			if (response && !error) {
				dispatch(updateEditor({ id, editor }));
				return Promise.resolve({ response, editor });
			}
			return Promise.resolve(payload);
		});

	const onSave = ({
		draft = true,
		isNew = true,
		editor
	}: {
		draft?: boolean;
		isNew?: boolean;
		editor: Editor;
	}): Promise<any> =>
		isNew ? createAppointmentFn(draft, editor) : modifyAppointmentFn(draft, editor);

	const onSend = (isNew: boolean, editor: Editor): Promise<any> =>
		context?.isProposeNewTime ? onProposeNewTime() : onSave({ draft: false, isNew, editor });

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
		onRecurrenceFrequencyChange,
		onEditorRecurrenceIntervalChange,
		onSave,
		onSend
	};
};

export type EditorContext = {
	isInstance?: boolean;
	dispatch: Dispatch;
	folders: Array<Folder>;
	isProposeNewTime?: boolean;
	panel?: boolean;
	searchPanel?: boolean;
} & Partial<Editor>;

export const generateEditor = ({
	event,
	invite,
	context
}: {
	event?: EventPropType;
	invite?: Invite;
	context: EditorContext;
}): { editor: Editor; callbacks: EditorCallbacks } => {
	const id = getNewEditId(event?.resource?.id);
	const emptyEditor = createEmptyEditor(id, context.folders);

	const compiledEditor = normalizeEditor({
		invite,
		event,
		emptyEditor,
		context
	});

	const editor = applyContextToEditor({
		editor: compiledEditor,
		context
	});

	const callbacks = createCallbacks(id, context);

	const newEditor: Editor = { ...editor, calendar: omit(editor.calendar, ['parent', 'children']) };
	context.dispatch(createNewEditor(newEditor));

	return {
		editor: newEditor,
		callbacks
	};
};
