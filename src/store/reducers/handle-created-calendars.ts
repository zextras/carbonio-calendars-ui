/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Calendar } from '../../types/store/calendars';
import { CalendarSlice } from '../../types/store/store';
import { addCalendarsToStore, extractCalendars } from '../../utils/store/calendars';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleCreatedCalendarsReducer = (state: CalendarSlice, { payload }: any): void => {
	const foldersToAdd = extractCalendars(payload) as Record<string, Calendar>;
	addCalendarsToStore(state, Object.values(foldersToAdd));
};
