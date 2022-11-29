/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/no-extraneous-dependencies */

import { faker } from '@faker-js/faker';
import { nanoid } from '@reduxjs/toolkit';
import { find, isNil, map, reduce, startsWith, values } from 'lodash';
import moment from 'moment';
import { getIdentityItems } from '../../commons/get-identity-items';
import { PREFS_DEFAULTS } from '../../constants';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { disabledFields, getEndTime } from '../../commons/editor-generator';
import { getPrefs } from '../../carbonio-ui-commons/utils/get-prefs';

export const getIdentity = () => ({
	firstName: faker?.name?.firstName?.() ?? '',
	lastName: faker?.name?.lastName?.() ?? ''
});

export const getRandomInRange = (min = 1, max = 3) => faker.datatype.number({ max, min });

export const getRandomCalendarFlags = () => {
	const flags = ['', '#', '~', 'o', 'y', 'i', '*', 'b'];
	const index = getRandomInRange(0, flags.length - 1);
	return flags[index];
};

export const getRandomEditorId = (isNew) => {
	const randomId = getRandomInRange(1, 5);
	return isNew ? `new-${randomId}` : `edit-${randomId}`;
};

export const generateCalendarItem = (calendar) => {
	const calendarName = faker.commerce.product();
	return {
		id: nanoid(),
		name: calendarName,
		haveWriteAccess: true,
		color: {
			color: getRandomInRange(0, 8)
		},
		absFolderPath: `/${calendarName}`,
		acl: undefined,
		activesyncdisabled: false,
		children: [],
		deletable: false,
		depth: 1,
		f: getRandomCalendarFlags(),
		i4ms: 6046,
		i4n: undefined,
		i4next: 396,
		i4u: undefined,
		isLink: false,
		l: '1',
		luuid: faker.datatype.uuid(),
		md: undefined,
		meta: undefined,
		ms: 1,
		n: 4,
		perm: undefined,
		recursive: false,
		rest: undefined,
		retentionPolicy: undefined,
		rev: 1,
		rgb: undefined,
		s: 0,
		u: undefined,
		url: undefined,
		uuid: faker.datatype.uuid(),
		view: 'appointment',
		webOfflineSyncDays: 0,
		...(calendar ?? {})
	};
};

const defaultCalendar = {
	...generateCalendarItem(),
	id: '10',
	name: 'Calendar',
	haveWriteAccess: true
};

const defaultIdentity = getIdentity();
const defaultFullName = `${defaultIdentity.firstName} ${defaultIdentity.lastName}`;
const defaultEmail =
	faker?.internet?.email?.(defaultIdentity.firstName, defaultIdentity.lastName) ?? '';

const defaultOrganizer = {
	address: faker?.internet?.email?.(defaultIdentity.firstName, defaultIdentity.lastName) ?? '',
	fullName: defaultFullName,
	identityName: 'DEFAULT',
	label: `DEFAULT ${defaultFullName} (${defaultEmail})`,
	type: undefined,
	value: 0
};

export const generateCalendarsArray = ({ length = 1, folders } = {}) => {
	if (length === 0) return [defaultCalendar];
	if (folders?.length > 0) {
		return [defaultCalendar, ...map(folders, generateCalendarItem)];
	}
	return [defaultCalendar, ...map(Array(length), generateCalendarItem)];
};

export const getEditor = ({ id, folders, organizer }) => {
	const identities = getIdentityItems();
	const {
		zimbraPrefTimeZoneId,
		zimbraPrefCalendarDefaultApptDuration,
		zimbraPrefCalendarApptReminderWarningTime
	} = getPrefs();
	const editorOrganizer = find(identities, ['identityName', organizer?.identityName ?? 'DEFAULT']);
	const editorCalendar = find(folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);
	return {
		attach: undefined,
		calendar: editorCalendar
			? {
					id: editorCalendar.id,
					name: editorCalendar.name, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					color: editorCalendar.color // @ts-ignore
						? ZIMBRA_STANDARD_COLORS[editorCalendar.color]
						: setCalendarColor(editorCalendar),
					owner: editorCalendar?.owner
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

export const generateEditorSliceItem = ({
	editor,
	calendar = defaultCalendar,
	organizer = defaultOrganizer
} = {}) => {
	const id = editor?.id ?? getRandomEditorId();
	const newEditor = getEditor({ id, folders: calendar, organizer });
	return {
		[newEditor.id]: {
			...newEditor,
			...(editor ?? {})
		}
	};
};

export const generateCalendarSliceItem = ({
	length = getRandomInRange(),
	supportNesting = false,
	folders
} = {}) =>
	reduce(
		folders ?? Array.from({ length }),
		(acc, v) => {
			const hasItems = supportNesting ? faker.datatype.boolean() : undefined;
			const itemNumbers = hasItems ? getRandomInRange() : 0;
			const item = generateCalendarItem(v);

			return isNil(hasItems)
				? {
						...acc,
						[item.id]: item
				  }
				: {
						...acc,
						[item.id]: {
							...item,
							items: hasItems ? values(generateCalendarSliceItem({ length: itemNumbers })) : []
						}
				  };
		},
		{ 10: defaultCalendar }
	);

export const mockStore = (reducers = {}) => {
	const { calendars = {}, editor = {}, appointments = {}, invites = {} } = reducers;
	return {
		calendars: {
			calendars: {},
			status: 'idle',
			start: moment().subtract('7', 'days').valueOf(),
			end: moment().add('15', 'days').valueOf(),
			...calendars
		},
		editor: {
			activeId: undefined,
			editorPanel: undefined,
			editors: {},
			searchActiveId: undefined,
			status: 'idle',
			...editor
		},
		appointments: {
			status: 'init',
			appointments: {},
			...appointments
		},
		invites: {
			status: 'idle',
			invites: {},
			...invites
		}
	};
};
