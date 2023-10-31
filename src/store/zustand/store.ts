/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';
import { create } from 'zustand';
import { Resource } from '../../types/editor';

export type SetRange = ({ start, end }: { start: number; end: number }) => void;
export type CalendarRange = {
	start: number;
	end: number;
};

export type AppState = {
	calendarView: string;
	date: Date;
	summaryViewCounter: number;
	range: CalendarRange;
	setRange: SetRange;
	resources: Array<Resource> | undefined;
};

export const useAppStatusStore = create<AppState>((set) => ({
	calendarView: '',
	date: new Date(),
	summaryViewCounter: 0,
	resources: undefined,
	range: {
		start: moment().subtract('7', 'days').valueOf(),
		end: moment().add('15', 'days').valueOf()
	},
	setRange: ({ start, end }: { start: number; end: number }): void => {
		set(({ range }) => {
			if (start < range.start) {
				if (moment(range.end).diff(moment(start), 'days') >= 400) {
					return {
						range: {
							end: moment(start).add('399', 'days').valueOf(),
							start
						}
					};
				}
				return { range: { ...range, start } };
			}
			if (range.end < end) {
				if (moment(end).diff(moment(range.start), 'days') >= 400) {
					return {
						range: { start: moment(end).subtract('399', 'days').valueOf(), end }
					};
				}
				return { range: { ...range, end } };
			}
			return { range };
		});
	}
}));
