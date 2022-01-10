/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CalendarSlice } from '../../types/store/store';
import { removeCalendarsFromStore } from '../../utils/store/calendars';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleDeletedCalendarsReducer = (state: CalendarSlice, { payload }: any): void => {
	removeCalendarsFromStore(state, payload);
};
