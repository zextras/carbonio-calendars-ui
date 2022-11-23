/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/no-extraneous-dependencies */

import { faker } from '@faker-js/faker';
import { nanoid } from '@reduxjs/toolkit';
import { isNil, reduce, values } from 'lodash';
import moment from 'moment';

export const getRandomInRange = (min = 1, max = 3) => faker.datatype.number({ max, min });

export const getRandomEditorId = (isNew) => {
	const randomId = getRandomInRange(1, 5);
	return isNew ? `new-${randomId}` : `edit-${randomId}`;
};

export const generateCalendarItem = (calendar) => ({
	id: nanoid(),
	name: faker.commerce.product(),
	haveWriteAccess: true,
	color: {
		color: getRandomInRange(0, 8)
	},
	...(calendar ?? {})
});

const defaultCalendar = {
	...generateCalendarItem(),
	id: '10',
	name: 'Calendar',
	haveWriteAccess: true
};

export const generateEditorSliceItem = ({ editor, calendar = defaultCalendar } = {}) => {
	const id = editor?.id ?? getRandomEditorId();
	return {
		[id]: {
			id,
			allDay: false,
			attach: undefined,
			attachmentFiles: [],
			attendees: [],
			calendar,
			class: 'PUB',
			disabled: {
				allDay: false,
				attachments: false,
				attachmentsButton: false,
				attendees: false,
				calendarSelector: false,
				composer: false,
				datePicker: false,
				freeBusySelector: false,
				location: false,
				optionalAttendees: false,
				organizer: false,
				private: false,
				recurrence: false,
				reminder: false,
				richTextButton: false,
				saveButton: false,
				sendButton: false,
				timezone: false,
				title: false,
				virtualRoom: false
			},
			end: 1663324705236,
			exceptId: undefined,
			freeBusy: 'B',
			inviteId: undefined,
			isException: false,
			isInstance: true,
			isNew: true,
			isRichText: true,
			isSeries: false,
			location: '',
			optionalAttendees: [],
			organizer: {
				address: 'gabriele.marino@zextras.com',
				fullName: 'Gabriele Marino',
				identityName: 'DEFAULT',
				label: 'DEFAULT Gabriele Marino (<gabriele.marino@zextras.com>) ',
				type: undefined,
				value: 0
			},
			panel: false,
			plainText: '',
			recur: null,
			reminder: '5',
			richText: '',
			room: undefined,
			start: 1663321105236,
			timezone: 'Europe/Berlin',
			title: 'Nuovo appuntamento',
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

// generateCalendarsSlice({ supportNesting: false })
export const mockEmptyStore = (reducers = {}) => {
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
