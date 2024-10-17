/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { GroupCalendar } from '../../../types/groups';

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
