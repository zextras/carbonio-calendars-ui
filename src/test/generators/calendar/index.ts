/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { nanoid } from '@reduxjs/toolkit';
import { Folder } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
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
	...getCalendar(),
	id: '10',
	name: 'Calendar',
	haveWriteAccess: true
};

const getCalendarsArray = ({ length = 1, folders } = {} as CalendarsArrayProps): Array<any> => {
	if (length === 0) return [defaultCalendar];
	if (folders?.length && folders?.length > 0) {
		return [defaultCalendar, ...map(folders, getCalendar)];
	}
	return [defaultCalendar, ...map(Array(length), getCalendar)];
};

export default { defaultCalendar, getCalendar, getCalendarsArray };
