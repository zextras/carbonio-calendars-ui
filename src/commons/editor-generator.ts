/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, isEmpty, isNaN, omit, startsWith } from 'lodash';
import moment from 'moment';
import { Dispatch } from 'redux';
import momentLocalizer from 'react-widgets-moment';
import { Folder, LinkFolder } from '../carbonio-ui-commons/types/folder';
import { setCalendarColor } from '../normalizations/normalizations-utils';
import { PREFS_DEFAULTS } from '../constants';
import { EventPropType, normalizeEditor } from '../normalizations/normalize-editor';
import { createNewEditor } from '../store/slices/editor-slice';
import { Editor } from '../types/editor';
import { Invite } from '../types/store/invite';
import { getPrefs } from '../carbonio-ui-commons/utils/get-prefs';
import { getIdentityItems } from './get-identity-items';

momentLocalizer(moment);

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
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime,
		zimbraPrefDefaultCalendarId
	} = getPrefs();
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);
	const defaultCalendar = find(folders, [
		'id',
		zimbraPrefDefaultCalendarId ?? PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	]);
	const defaultTimezone = moment.tz.guess(true);

	return {
		attach: undefined,
		calendar: defaultCalendar
			? {
					id: defaultCalendar.id,
					name: defaultCalendar.name,
					color: setCalendarColor({ color: defaultCalendar.color, rgb: defaultCalendar.rgb }),
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
		start: moment().set('second', 0).set('millisecond', 0).valueOf(),
		end: getEndTime({
			start: moment().set('second', 0).set('millisecond', 0).valueOf(),
			duration: zimbraPrefCalendarDefaultApptDuration as string
		}),
		inviteId: undefined,
		timezone: defaultTimezone,
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
}): Editor => {
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

	const newEditor = { ...editor, calendar: omit(editor.calendar, ['parent', 'children']) };
	context.dispatch(createNewEditor(newEditor));

	return newEditor;
};
