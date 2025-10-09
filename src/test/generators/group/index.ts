/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { CalendarGroup, useCalendarGroupStore } from '../../../store/zustand/calendar-group-store';
import { GroupCalendar } from '../../../types/groups';

export const generateGroup = ({
	id = faker.number.int().toString(),
	name = faker.lorem.word(),
	calendarId = times(faker.number.int({ min: 1, max: 5 }), () => faker.number.int().toString())
}: Partial<CalendarGroup> = {}): CalendarGroup => ({
	id,
	name,
	calendarId
});

export const generateGroupCalendar = ({
	id = faker.number.int().toString(),
	name = faker.lorem.word(),
	color = faker.number.int({ min: 0, max: 9 })
}: {
	id?: string;
	name?: string;
	color?: number;
} = {}): GroupCalendar => ({
	id,
	name,
	color
});

const generateAllCalendarsGroup = (): CalendarGroup => ({
	id: SIDEBAR_ITEMS.ALL_CALENDAR,
	name: 'All Calendars'
});

export const populateGroupsStore = ({ groups }: { groups: Array<CalendarGroup> }): void => {
	const allGroups: Array<CalendarGroup> = [];
	if (!groups.find((group) => group.id === SIDEBAR_ITEMS.ALL_CALENDAR)) {
		allGroups.push(generateAllCalendarsGroup());
	}
	allGroups.push(...groups);
	useCalendarGroupStore.setState(
		(state) => ({
			...state,
			groups: {
				...state.groups,
				...allGroups.reduce((acc, group) => ({ ...acc, [group.id]: group }), {})
			}
		}),
		true
	);
};
