/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, isNil, map, omitBy, reduce } from 'lodash';
import { normalizePartialCalendar } from '../../normalizations/normalize-calendars';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleModifiedCalendarsReducer = (state: CalendarSlice, { payload }: any): void => {
	const foldersToAdd = map(payload, (c) => omitBy(normalizePartialCalendar(c), isNil));

	state.calendars = reduce(
		state.calendars,
		(acc, item) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const newFolder = find(foldersToAdd, (c) => c.id === item.id);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const toRet = newFolder
				? { ...item, ...newFolder, haveWriteAccess: item.perm ? /w/.test(item.perm) : true }
				: { ...item, haveWriteAccess: item.perm ? /w/.test(item.perm) : true };
			return {
				...acc,
				[toRet.id]: toRet
			};
		},
		{}
	);
};
