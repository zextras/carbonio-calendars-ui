import { Folder, LinkFolder } from '@zextras/carbonio-shell-ui';
import { find, map, startsWith } from 'lodash';
import moment from 'moment';
import { createFakeIdentity } from '../../../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import { getPrefs } from '../../../carbonio-ui-commons/utils/get-prefs';
import { disabledFields, getEndTime } from '../../../commons/editor-generator';
import { getIdentityItems } from '../../../commons/get-identity-items';
import { ZIMBRA_STANDARD_COLORS } from '../../../commons/zimbra-standard-colors';
import { PREFS_DEFAULTS } from '../../../constants';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { Editor, IdentityItem } from '../../../types/editor';
import utils from '../utils';

const getDefaultEditor = ({
	folders,
	organizer
}: {
	folders: any;
	organizer?: IdentityItem;
}): Omit<Editor, 'isException' | 'isSeries' | 'isInstance'> => {
	const identities = getIdentityItems();
	const {
		zimbraPrefTimeZoneId,
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime
	} = getPrefs();
	const editorOrganizer = find(identities, ['identityName', organizer?.identityName ?? 'DEFAULT']);
	const editorCalendar = find(folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);
	const id = utils.getRandomEditorId();
	return {
		attach: undefined,
		calendar: editorCalendar
			? {
					id: editorCalendar.id,
					name: editorCalendar.name, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					color: editorCalendar.color // @ts-ignore
						? ZIMBRA_STANDARD_COLORS[editorCalendar.color]
						: setCalendarColor(editorCalendar),
					owner: (editorCalendar as LinkFolder)?.owner
			  }
			: undefined,
		panel: false,
		exceptId: undefined,
		isRichText: true,
		isNew: startsWith(id, 'new'),
		attachmentFiles: [],
		organizer: editorOrganizer,
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
			duration: zimbraPrefCalendarDefaultApptDuration
		}),
		inviteId: undefined,
		timezone: zimbraPrefTimeZoneId,
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
	const {
		zimbraPrefTimeZoneId,
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime
	} = getPrefs();
	const editorOrganizer = find(identities, ['identityName', organizer?.identityName ?? 'DEFAULT']);
	const editorCalendar = find(folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);
	const id = editor?.id ?? utils.getRandomEditorId();
	const editorType = getRandomEditorType();
	return {
		attach: undefined,
		calendar: editorCalendar
			? {
					id: editorCalendar.id,
					name: editorCalendar.name, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					color: editorCalendar.color // @ts-ignore
						? ZIMBRA_STANDARD_COLORS[editorCalendar.color]
						: setCalendarColor(editorCalendar),
					owner: (editorCalendar as LinkFolder)?.owner
			  }
			: undefined,
		panel: false,
		exceptId: undefined,
		isRichText: true,
		isNew: startsWith(id, 'new'),
		attachmentFiles: [],
		organizer: editorOrganizer,
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
			duration: zimbraPrefCalendarDefaultApptDuration
		}),
		inviteId: undefined,
		timezone: zimbraPrefTimeZoneId,
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

const getSingle = (context: {
	folders?: any;
	organizer?: IdentityItem;
	editor?: Editor;
}): Editor => {
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

const getInstanceOfSeries = (context: {
	folders?: any;
	organizer?: IdentityItem;
	editor?: Editor;
}): Editor => {
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

const getException = (context: {
	folders?: any;
	organizer?: IdentityItem;
	editor?: Editor;
}): Editor => {
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

const getSeries = (context: {
	folders?: any;
	organizer?: IdentityItem;
	editor?: Editor;
}): Editor => {
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
