/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { nanoid } from '@reduxjs/toolkit';
import { reduce } from 'lodash';

import { Folder, Folders } from '../../../carbonio-ui-commons/types/folder';
import utils from '../utils';

type CalendarsArrayProps = {
	length?: number;
	folders?: Array<any>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getCalendar = (calendar?: any): Folder => {
	const calendarName = faker.commerce.product();
	return {
		id: nanoid(),
		name: calendarName,
		haveWriteAccess: true,
		color: {
			color: utils.getRandomInRange({ min: 0, max: 8 })
		},
		absFolderPath: `/${calendarName}`,
		acl: undefined,
		activesyncdisabled: false,
		children: [],
		deletable: false,
		depth: 1,
		f: utils.getRandomCalendarFlags(),
		i4ms: 6046,
		i4n: undefined,
		i4next: 396,
		i4u: undefined,
		isLink: false,
		l: '1',
		luuid: faker.string.uuid(),
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
		uuid: faker.string.uuid(),
		view: 'appointment',
		webOfflineSyncDays: 0,
		...(calendar ?? {})
	};
};

const defaultCalendar = {
	...getCalendar(),
	id: '10',
	name: 'Calendar',
	haveWriteAccess: true
};

const getCalendarsMap = ({ length = 1, folders } = {} as CalendarsArrayProps): Folders => {
	if (length === 0) return { [defaultCalendar.id]: defaultCalendar };
	if (folders?.length && folders?.length > 0) {
		return {
			[defaultCalendar.id]: defaultCalendar,
			...reduce(
				folders,
				(acc, v) => {
					const calendar = getCalendar(v);
					return { ...acc, [calendar.id]: calendar };
				},
				{} as Folders
			)
		};
	}
	return {
		[defaultCalendar.id]: defaultCalendar,
		...reduce(
			Array(length),
			(acc) => {
				const calendar = getCalendar();
				return { ...acc, [calendar.id]: calendar };
			},
			{} as Folders
		)
	};
};

export default { defaultCalendar, getCalendar, getCalendarsMap };
