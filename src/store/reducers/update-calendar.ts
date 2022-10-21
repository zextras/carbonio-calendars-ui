/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach } from 'lodash';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleUpdateCalendar = (state: CalendarSlice, { payload }: any): void => {
	forEach(payload, ({ id }) => {
		state.calendars = {
			...state.calendars,
			[id]: {
				...state.calendars[id],
				broken: true
			}
		};
	});
};
