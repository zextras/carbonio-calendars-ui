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

export function generateMessage() {
	return {};
}

export function generateAppointments() {
	const appointments = [];

	return appointments;
}

export const generateCalendarItem = () => ({
	id: nanoid(),
	name: faker.commerce.product()
});

export const generateSliceCalendarMap = ({
	length = faker.datatype.number({ max: 3, min: 1 }),
	supportNesting = true
}) =>
	reduce(
		Array.from({ length }),
		(acc) => {
			const hasItems = supportNesting ? faker.datatype.boolean() : undefined;
			const itemNumbers = hasItems ? faker.datatype.number({ max: 3, min: 1 }) : 0;
			const item = generateCalendarItem();

			return isNil(hasItems)
				? {
						...acc,
						[item.id]: item
				  }
				: {
						...acc,
						[item.id]: {
							...item,
							items: hasItems ? values(generateSliceCalendarMap({ length: itemNumbers })) : []
						}
				  };
		},
		{}
	);

export const generateCalendarsSlice = ({
	length = faker.datatype.number({ max: 3, min: 1 }),
	supportNesting = true
}) => ({
	calendars: generateSliceCalendarMap({ length, supportNesting }),
	status: 'idle',
	start: moment().subtract('7', 'days').valueOf(),
	end: moment().add('15', 'days').valueOf()
});

export const generateStore = () => ({
	calendars: generateCalendarsSlice({ supportNesting: false })
});
