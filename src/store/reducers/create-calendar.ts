/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep } from 'lodash';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCalendarFullFilled = (state: CalendarSlice, { payload, meta }: any): any => {
	const [calendars] = payload;
	delete state.calendars[meta.arg.tmpId];
	Object.assign(state.calendars, calendars);
	const newItem = cloneDeep(state);
	state.status = 'succeeded';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCalendarPending = (state: CalendarSlice, { meta }: any): any => {
	const { name, color, excludeFreeBusy } = meta.arg;
	// eslint-disable-next-line no-param-reassign
	meta.arg.tmpId = new Date().valueOf().toString();
	Object.assign(state.calendars, {
		[meta.arg.tmpId]: {
			checked: false,
			freeBusy: excludeFreeBusy,
			color: ZIMBRA_STANDARD_COLORS[color],
			id: meta.arg.tmpId,
			name,
			parent: '1'
		}
	});

	state.status = 'pending';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCalendarRejected = (state: CalendarSlice, { payload, meta }: any): any => {
	// eslint-disable-next-line no-console
	console.log(payload, meta);
	state.status = 'error';
};
