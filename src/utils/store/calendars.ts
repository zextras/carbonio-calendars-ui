/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy, reduce, some } from 'lodash';
import { normalizeCalendar } from '../../normalizations/normalize-calendars';
import { Calendar } from '../../types/store/calendars';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const extractCalendars = (accordion: any, acc = {}): any =>
	reduce(
		accordion,
		(acc2, folder) => {
			if (folder.folder) {
				return folder.view === 'appointment' || folder.id === FOLDERS.TRASH
					? {
							...acc2,
							[folder.id]: omitBy(normalizeCalendar(folder), isNil),
							...extractCalendars(folder.folder, acc2)
					  }
					: { ...acc2, ...extractCalendars(folder.folder, acc2) };
			}
			return folder.view === 'appointment' || folder.id === FOLDERS.TRASH
				? { ...acc2, [folder.id]: omitBy(normalizeCalendar(folder), isNil) }
				: acc2;
		},
		acc
	);

export const addCalendarsToStore = (state: CalendarSlice, calendars: Array<Calendar>): void => {
	state.calendars = reduce(calendars, (acc, v) => ({ ...acc, [v.id]: v }), state.calendars);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const removeCalendarsFromStore = (state: CalendarSlice, idsToDelete: any): void => {
	state.calendars = reduce(
		state.calendars,
		(acc, v) => {
			const value = some(idsToDelete, (cid) => cid === v.id);
			return value ? { ...acc } : { ...acc, [v.id]: v };
		},
		{}
	);
};
