/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { Folders, LinkFolder, getPrefs } from '@zextras/carbonio-ui-commons';
import { find, isEmpty, isNaN, omit, startsWith } from 'lodash';
import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import { Dispatch } from 'redux';

import { getIdentityItems } from './get-identity-items';
import { PREFS_DEFAULTS } from '../constants';
import { EVENT_DISPLAY_STATUS } from '../constants/api';
import { normalizeEditor } from '../normalizations/normalize-editor';
import { createNewEditor } from '../store/slices/editor-slice';
import { Editor } from '../types/editor';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { getNewId } from '../utils/event';

momentLocalizer();

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
	meetingRoom: false,
	virtualRoom: false,
	equipment: false,
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

export const createEmptyEditor = (id: string, folders: Folders): Editor => {
	const identities = getIdentityItems();
	const {
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime,
		zimbraPrefDefaultCalendarId
	} = getPrefs();
	const account = getUserAccount();
	const defaultOrganizerIdentity = find(identities, ['identityName', 'DEFAULT']);
	const defaultOrganizer = {
		email: defaultOrganizerIdentity?.address ?? account?.name ?? '',
		fullName: defaultOrganizerIdentity?.fullName
	};
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
					rgb: defaultCalendar.rgb,
					color: defaultCalendar.color,
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
		sender: defaultOrganizer,
		title: '',
		location: '',
		meetingRoom: undefined,
		equipment: undefined,
		room: undefined,
		attendees: [],
		optionalAttendees: [],
		allDay: false,
		freeBusy: EVENT_DISPLAY_STATUS.BUSY,
		class: 'PUB',
		originalStart: new Date(new Date().setSeconds(0, 0)).getTime(),
		originalEnd: getEndTime({
			start: new Date(new Date().setSeconds(0, 0)).getTime(),
			duration: zimbraPrefCalendarDefaultApptDuration as string
		}),
		start: new Date(new Date().setSeconds(0, 0)).getTime(),
		end: getEndTime({
			start: new Date(new Date().setSeconds(0, 0)).getTime(),
			duration: zimbraPrefCalendarDefaultApptDuration as string
		}),
		inviteId: undefined,
		timezone: defaultTimezone,
		reminder: zimbraPrefCalendarApptReminderWarningTime as string,
		recur: undefined,
		richText: '',
		plainText: '',
		disabled: disabledFields,
		id,
		compNum: 0,
		isDirty: false
	};
};

export const applyContextToEditor = ({
	editor,
	context
}: {
	editor: Editor;
	context: EditorContext;
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
	folders: Folders;
	isProposeNewTime?: boolean;
	panel?: boolean;
	searchPanel?: boolean;
} & Partial<Editor>;

export const generateEditor = ({
	event,
	invite,
	context
}: {
	event?: EventType;
	invite?: Invite;
	context: EditorContext;
}): Editor => {
	const id = getNewId(event?.resource?.id);
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

	context.dispatch(createNewEditor(editor));

	return editor;
};
