/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';
import { CalendarSlice } from '../../types/store/store';

export const setRangeReducer = (
	state: CalendarSlice,
	{ payload }: { payload: { start: number; end: number } }
): void => {
	const { start, end } = payload;
	if (start < state.start) {
		state.start = start;
		if (moment(state.end).diff(moment(start), 'days') >= 400) {
			state.end = moment(start).add('399', 'days').valueOf();
		}
	}
	if (state.end < end) {
		state.end = end;
		if (moment(end).diff(moment(state.start), 'days') >= 400) {
			state.start = moment(end).subtract('399', 'days').valueOf();
		}
	}
};
