/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { normalizeCalendar } from '../../normalizations/normalize-calendars';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getFolderFullFilled = (state: CalendarSlice, { meta, payload }: any): void => {
	if (payload.folder) state.calendars[meta.arg] = normalizeCalendar(payload.folder);
	if (payload.link) state.calendars[meta.arg] = normalizeCalendar(payload.link);
};
