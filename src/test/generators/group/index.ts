/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { CalendarGroup } from '../../../carbonio-ui-commons/types';
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

export const populateGroupsStore = ({ groups }: { groups: Array<CalendarGroup> }): void => {
	useFolderStore.setState((state) => ({ ...state, updateGroups: jest.fn(), groups }), true);
};
