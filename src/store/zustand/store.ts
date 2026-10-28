/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { addDays, differenceInDays, endOfDay, startOfDay, subDays } from 'date-fns';
import type { View } from 'react-big-calendar';
import { create } from 'zustand';

export type SetRange = ({ start, end }: { start: number; end: number }) => void;
export type CalendarRange = {
	start: number;
	end: number;
};

export type AppState = {
	calendarView: View | undefined;
	date: Date;
	summaryViewId: string | undefined;
	range: CalendarRange;
	setRange: SetRange;
	// exact boundaries of the days currently visible on the calendar board,
	// as opposed to `range`, which only ever grows and is used to fetch appointments
	visibleRange: CalendarRange;
	setVisibleRange: SetRange;
	summaryViewRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const useAppStatusStore = create<AppState>((set) => ({
	calendarView: undefined,
	date: new Date(),
	summaryViewId: undefined,
	summaryViewRef: React.createRef(),
	range: {
		start: subDays(new Date(), 7).getTime(),
		end: addDays(new Date(), 15).getTime()
	},
	setRange: ({ start, end }: { start: number; end: number }): void => {
		set(({ range }) => {
			if (start < range.start) {
				if (differenceInDays(new Date(range.end), new Date(start)) >= 400) {
					return {
						range: {
							end: addDays(new Date(start), 399).getTime(),
							start
						}
					};
				}
				return { range: { ...range, start } };
			}
			if (range.end < end) {
				if (differenceInDays(new Date(end), new Date(range.start)) >= 400) {
					return {
						range: { start: subDays(new Date(end), 399).getTime(), end }
					};
				}
				return { range: { ...range, end } };
			}
			return { range };
		});
	},
	visibleRange: {
		start: startOfDay(new Date()).getTime(),
		end: endOfDay(new Date()).getTime()
	},
	setVisibleRange: ({ start, end }: { start: number; end: number }): void => {
		set({ visibleRange: { start, end } });
	}
}));
