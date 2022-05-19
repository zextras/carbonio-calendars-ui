/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import moment from 'moment';
import { add as datesAdd } from 'date-arithmetic';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import { find, findLast, reduce } from 'lodash';
import { Navigate } from 'react-big-calendar';
import { WorkWeekDay } from '../../utils/work-week';

// Needed by the "range" and "title" functions
let schedule: WorkWeekDay[] = [];

export interface WorkViewProps {
	date: Date;
	workingSchedule: WorkWeekDay[];
}

export interface WorkWeekBounds {
	start: number;
	end: number;
}

export interface WorkViewComponent extends React.FC<WorkViewProps> {
	range(rangeDate: Date): Date[];
	// no-explicit-any: Navigate enums are declared "any" by BigCalendar
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	navigate(navigateDate: Date, action: any): Date;
	weekBounds(week: WorkWeekDay[]): WorkWeekBounds;
	title(titleDate: Date): string;
}

export const WorkView: WorkViewComponent = (props: WorkViewProps): JSX.Element => {
	const { date, workingSchedule } = props;

	// Looks horrible but there is no other way to pass and sync the workingSchedule
	schedule = useMemo(() => workingSchedule, [workingSchedule]);

	const range = useMemo(() => WorkView.range(date), [date]);

	return (
		<TimeGrid
			{...props}
			range={range}
			max={new Date(0, 0, 0, 23, 0, 0)}
			min={new Date(0, 0, 0, 0, 0, 0)}
		/>
	);
};

// Called by BigCalendar on week change
WorkView.range = (rangeDate: Date): Date[] => {
	const current = moment(rangeDate).day();
	const d = moment(rangeDate).set({ hour: 0, minute: 0, second: 0 });
	return reduce(
		schedule,
		(acc: Date[], day: WorkWeekDay, i: number) => {
			if (day.working) {
				acc.push(datesAdd(d, i - current, 'day'));
			}
			return acc;
		},
		[]
	);
};

// no-unused-vars: Actually called by BigCalendar
// no-explicit-any: Navigate enums are declared "any" by BigCalendar
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
WorkView.navigate = (navigateDate: Date, action: any): Date => {
	switch (action) {
		case Navigate.PREVIOUS:
			return datesAdd(navigateDate, -7, 'day');

		case Navigate.NEXT:
			return datesAdd(navigateDate, 7, 'day');

		default:
			return navigateDate;
	}
};

WorkView.weekBounds = (week: WorkWeekDay[]): WorkWeekBounds => {
	const firstDay = find(week, (day) => day.working);
	const lastDay = findLast(week, (day) => day.working);

	return {
		start: firstDay ? parseInt(firstDay.day, 10) - 1 : 0,
		end: lastDay ? parseInt(lastDay.day, 10) - 1 : 6
	} as WorkWeekBounds;
};

// no-unused-vars: Actually called by BigCalendar
// eslint-disable-next-line @typescript-eslint/no-unused-vars
WorkView.title = (titleDate: Date): string => {
	const { start, end } = WorkView.weekBounds(schedule);
	const startDate = moment(titleDate).day(start);
	const endDate = datesAdd(startDate, end - start, 'day');
	const isMonthSame = moment(startDate).format('MMMM') === moment(endDate).format('MMMM');
	return isMonthSame
		? `${moment(startDate).format('MMMM DD')} - ${moment(endDate).format('DD')}`
		: ` ${moment(startDate).format('MMMM DD')} - ${moment(endDate).format('MMMM DD')}`;
};
