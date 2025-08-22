/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Folder, LinkFolder, getPrefs } from '@zextras/carbonio-ui-commons';
import { find, map, startsWith } from 'lodash';

import { disabledFields, getEndTime } from '../../../commons/editor-generator';
import { getIdentityItems } from '../../../commons/get-identity-items';
import { PREFS_DEFAULTS } from '../../../constants';
import { EVENT_DISPLAY_STATUS } from '../../../constants/api';
import { Editor, IdentityItem } from '../../../types/editor';
import utils from '../utils';
import { createFakeIdentity } from '@test-utils/accounts/fakeAccounts';

const getDefaultEditor = ({
	folders,
	organizer
}: {
	folders: any;
	organizer?: IdentityItem;
}): Omit<Editor, 'isException' | 'isSeries' | 'isInstance'> => {
	const identities = getIdentityItems();
	const { zimbraPrefCalendarDefaultApptDuration, zimbraPrefCalendarApptReminderWarningTime } =
		getPrefs();
	const editorOrganizer = find(identities, ['identityName', organizer?.identityName ?? 'DEFAULT']);
	const editorCalendar = find(folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);
	const id = utils.getRandomEditorId();
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	return {
		attach: undefined,
		compNum: 0,
		calendar: editorCalendar
			? {
					id: editorCalendar.id,
					name: editorCalendar.name,
					rgb: editorCalendar.rgb,
					color: editorCalendar.color,
					owner: (editorCalendar as LinkFolder)?.owner
				}
			: undefined,
		panel: false,
		exceptId: undefined,
		isRichText: true,
		isNew: startsWith(id, 'new'),
		attachmentFiles: [],
		organizer: { email: editorOrganizer?.address ?? '', fullName: editorOrganizer?.fullName ?? '' },
		sender: { email: editorOrganizer?.address ?? '', fullName: editorOrganizer?.fullName ?? '' },
		title: '',
		location: '',
		room: undefined,
		attendees: [],
		optionalAttendees: [],
		allDay: false,
		freeBusy: EVENT_DISPLAY_STATUS.BUSY,
		class: 'PUB',
		originalStart: new Date().getTime(),
		originalEnd: getEndTime({
			start: new Date().getTime(),
			duration: zimbraPrefCalendarDefaultApptDuration
		}),
		start: new Date().getTime(),
		end: getEndTime({
			start: new Date().getTime(),
			duration: zimbraPrefCalendarDefaultApptDuration
		}),
		inviteId: undefined,
		timezone,
		reminder: zimbraPrefCalendarApptReminderWarningTime,
		recur: undefined,
		richText: '',
		plainText: '',
		disabled: disabledFields,
		id
	};
};

const getRandomAttendees = (context?: { length?: number }): Array<any> => {
	const length = context?.length ?? utils.getRandomInRange({ max: 5 });

	return map({ length }, () => {
		const attendee = createFakeIdentity();
		return {
			email: attendee.email,
			fullName: attendee.fullName,
			id: attendee.id,
			label: attendee.fullName
		};
	});
};

type EditorType = Pick<Editor, 'isException' | 'isSeries' | 'isInstance'>;

const getRandomEditorType = (type?: 'single' | 'series' | 'exception' | 'instance'): EditorType => {
	const single = utils.getSingleEditorFields();
	const exception = utils.getExceptionEditorFields();
	const series = utils.getSeriesEditorFields();
	const instance = utils.getInstanceEditorFields();

	const types = [single, exception, series, instance];

	switch (type) {
		case 'single':
			return single;
		case 'exception':
			return exception;
		case 'series':
			return series;
		case 'instance':
			return instance;
		default:
			return types[utils.getRandomInRange({ min: 0, max: types.length - 1 })];
	}
};

const getEditor = ({
	editor,
	folders,
	organizer
}: {
	editor?: Partial<Editor>;
	folders: Folder[];
	organizer?: IdentityItem;
}): Editor => {
	const identities = getIdentityItems();
	const { zimbraPrefCalendarDefaultApptDuration, zimbraPrefCalendarApptReminderWarningTime } =
		getPrefs();
	const editorOrganizer = find(identities, ['identityName', organizer?.identityName ?? 'DEFAULT']);
	const editorCalendar = find(folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);
	const id = editor?.id ?? utils.getRandomEditorId();
	const editorType = getRandomEditorType();
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	return {
		attach: undefined,
		calendar: editorCalendar
			? {
					id: editorCalendar.id,
					name: editorCalendar.name,
					rgb: editorCalendar.rgb,
					color: editorCalendar.color,
					owner: (editorCalendar as LinkFolder)?.owner
				}
			: undefined,
		panel: false,
		exceptId: undefined,
		isRichText: true,
		compNum: 0,
		isNew: startsWith(id, 'new'),
		attachmentFiles: [],
		organizer: { email: editorOrganizer?.address ?? '', fullName: editorOrganizer?.fullName ?? '' },
		sender: { email: editorOrganizer?.address ?? '', fullName: editorOrganizer?.fullName ?? '' },
		title: '',
		location: '',
		room: undefined,
		attendees: [],
		optionalAttendees: [],
		allDay: false,
		freeBusy: EVENT_DISPLAY_STATUS.BUSY,
		class: 'PUB',
		originalStart: new Date().getTime(),
		originalEnd: getEndTime({
			start: new Date().getTime(),
			duration: zimbraPrefCalendarDefaultApptDuration
		}),
		start: new Date().getTime(),
		end: getEndTime({
			start: new Date().getTime(),
			duration: zimbraPrefCalendarDefaultApptDuration
		}),
		inviteId: undefined,
		timezone,
		reminder: zimbraPrefCalendarApptReminderWarningTime,
		recur: undefined,
		richText: '',
		plainText: '',
		disabled: disabledFields,
		id,
		...editorType,
		...(editor ?? {})
	};
};

const getSingle = (
	context: {
		folders?: any;
		organizer?: IdentityItem;
		editor?: Editor;
	} = {}
): Editor => {
	const defaultEditor = getDefaultEditor({
		folders: context.folders,
		organizer: context.organizer
	});
	const editorType = getRandomEditorType('single');

	return {
		...defaultEditor,
		...(context.editor ?? {}),
		...(editorType ?? {})
	};
};

const getInstanceOfSeries = (
	context: {
		folders?: any;
		organizer?: IdentityItem;
		editor?: Editor;
	} = {}
): Editor => {
	const defaultEditor = getDefaultEditor({
		folders: context.folders,
		organizer: context.organizer
	});
	const editorType = getRandomEditorType('instance');

	return {
		...defaultEditor,
		...(context.editor ?? {}),
		...(editorType ?? {})
	};
};

const getException = (
	context: {
		folders?: any;
		organizer?: IdentityItem;
		editor?: Editor;
	} = {}
): Editor => {
	const defaultEditor = getDefaultEditor({
		folders: context.folders,
		organizer: context.organizer
	});
	const editorType = getRandomEditorType('exception');

	return {
		...defaultEditor,
		...(context.editor ?? {}),
		...(editorType ?? {})
	};
};

const getSeries = (
	context: {
		folders?: any;
		organizer?: IdentityItem;
		editor?: Editor;
	} = {}
): Editor => {
	const defaultEditor = getDefaultEditor({
		folders: context.folders,
		organizer: context.organizer
	});
	const editorType = getRandomEditorType('series');

	return {
		...defaultEditor,
		...(context.editor ?? {}),
		...(editorType ?? {})
	};
};

export default {
	getRandomAttendees,
	getEditor,
	getSingle,
	getSeries,
	getInstanceOfSeries,
	getException,
	getRandomEditorType
};
