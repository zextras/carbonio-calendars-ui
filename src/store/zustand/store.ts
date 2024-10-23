/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';
import { create } from 'zustand';

import { useFolderStore } from '../../carbonio-ui-commons/store/zustand/folder';
import { CalendarGroup } from '../../carbonio-ui-commons/types';
import { Resource } from '../../types/editor';

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
	equipment: Array<Resource> | undefined;
	meetingRoom: Array<Resource> | undefined;
};

export const useAppStatusStore = create<AppState>((set) => ({
	calendarView: undefined,
	date: new Date(),
	summaryViewId: undefined,
	equipment: undefined,
	meetingRoom: undefined,
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

export const useGroup = (groupId: string): CalendarGroup | undefined =>
	useFolderStore((state) => state.groups.find((group) => group.id === groupId));
