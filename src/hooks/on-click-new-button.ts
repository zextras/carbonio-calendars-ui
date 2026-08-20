/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SyntheticEvent, useCallback } from 'react';

import { addBoard } from '@zextras/carbonio-shell-ui';
import { useFoldersMap, usePrefs } from '@zextras/carbonio-ui-commons';
import { endOfMonth, endOfWeek, isWithinInterval, startOfMonth, startOfWeek } from 'date-fns';

import { generateEditor, getEndTime } from '../commons/editor-generator';
import { CALENDAR_BOARD_ID } from '../constants';
import { useAppDispatch } from '../store/redux/hooks';
import {
	useCalendarDate,
	useCalendarView,
	useVisibleRangeEnd,
	useVisibleRangeStart
} from '../store/zustand/hooks';

export const useOnClickNewButton = (): ((
	ev?: SyntheticEvent<HTMLElement, Event> | KeyboardEvent
) => void) => {
	const calendarFolders = useFoldersMap();
	const dispatch = useAppDispatch();
	const calendarView = useCalendarView();
	const calendarDate = useCalendarDate();
	const visibleRangeStart = useVisibleRangeStart();
	const visibleRangeEnd = useVisibleRangeEnd();
	const { zimbraPrefCalendarDefaultApptDuration, zimbraPrefCalendarFirstDayOfWeek } = usePrefs();

	return useCallback(
		(ev) => {
			ev?.preventDefault?.();
			const now = new Date();

			// month/week's exact boundaries are computed directly from the navigation anchor
			// (calendarDate) instead of the tracked visible range:
			// - month view's visible range includes the previous/next month's padding days
			//   used to fill out the grid, so its start isn't necessarily the 1st of the month;
			// - react-big-calendar's onRangeChange never forwards the culture/locale to the week
			//   view's range() (a library limitation), so the tracked range for week view always
			//   comes back Sunday-based regardless of the zimbraPrefCalendarFirstDayOfWeek pref.
			let periodStart: Date = new Date(visibleRangeStart);
			let periodEnd: Date = new Date(visibleRangeEnd);
			if (calendarView === 'month') {
				periodStart = startOfMonth(calendarDate);
				periodEnd = endOfMonth(calendarDate);
			} else if (calendarView === 'week') {
				const weekStartsOn = (Number(zimbraPrefCalendarFirstDayOfWeek ?? 0) % 7) as
					| 0
					| 1
					| 2
					| 3
					| 4
					| 5
					| 6;
				periodStart = startOfWeek(calendarDate, { weekStartsOn });
				periodEnd = endOfWeek(calendarDate, { weekStartsOn });
			}

			const isTodayVisible = isWithinInterval(now, { start: periodStart, end: periodEnd });
			// use today when it's on screen, otherwise the first day of the visible period
			const start = isTodayVisible ? new Date(now) : new Date(periodStart);
			start.setHours(now.getHours(), now.getMinutes(), 0, 0);
			const startTime = start.getTime();
			const endTime = getEndTime({
				start: startTime,
				duration: zimbraPrefCalendarDefaultApptDuration
			});
			const editor = generateEditor({
				context: {
					panel: false,
					dispatch,
					folders: calendarFolders,
					start: startTime,
					originalStart: startTime,
					end: endTime,
					originalEnd: endTime
				}
			});

			addBoard({
				boardViewId: CALENDAR_BOARD_ID,
				title: editor.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		},
		[
			calendarDate,
			calendarFolders,
			calendarView,
			dispatch,
			visibleRangeEnd,
			visibleRangeStart,
			zimbraPrefCalendarDefaultApptDuration,
			zimbraPrefCalendarFirstDayOfWeek
		]
	);
};
