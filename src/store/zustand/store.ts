/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { addDays, differenceInDays, subDays } from 'date-fns';
import { create } from 'zustand';

export type SetRange = ({ start, end }: { start: number; end: number }) => void;
export type CalendarRange = {
	start: number;
	end: number;
};

export type CalendarView = 'week' | 'day' | 'month' | 'work_week';

export type AppState = {
	calendarView: CalendarView | undefined;
	date: Date;
	summaryViewId: string | undefined;
	range: CalendarRange;
	setRange: SetRange;
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
	}
}));
