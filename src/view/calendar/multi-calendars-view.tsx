/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { add as datesAdd } from 'date-arithmetic';
import moment from 'moment';
import { Navigate } from 'react-big-calendar';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';

export interface MultiCalendarsViewProps {
	date: Date;
}

export interface MultiCalendarsBounds {
	start: number;
	end: number;
}

export interface MultiCalendarsViewComponent extends React.FC<MultiCalendarsViewProps> {
	range(rangeDate: Date): Date[];
	// no-explicit-any: Navigate enums are declared "any" by BigCalendar
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	navigate(navigateDate: Date, action: any): Date;
	title(titleDate: Date): string;
}

export const MultiCalendarsView: MultiCalendarsViewComponent = (
	props: MultiCalendarsViewProps
): ReactElement => {
	const { date } = props;

	// Looks horrible but there is no other way to pass and sync the workingSchedule
	const [min, max, range] = useMemo(
		() => [
			new Date(moment(date).startOf('day').valueOf()),
			new Date(moment(date).endOf('day').valueOf()),
			MultiCalendarsView.range(date)
		],
		[date]
	);

	return <TimeGrid {...props} range={range} max={max} min={min} />;
};

// Called by BigCalendar on week change
MultiCalendarsView.range = (rangeDate: Date): Date[] => {
	const current = moment(rangeDate).day();
	const d = moment(rangeDate).startOf('day');
	// return reduce(
	// 	schedule,
	// 	(acc: Date[], day: WorkWeekDay, i: number) => {
	// 		if (day.working) {
	// 			acc.push(datesAdd(d, i - current, 'day'));
	// 		}
	// 		return acc;
	// 	},
	// 	[]
	// );
	return [new Date()]; // TODO
};

// no-unused-vars: Actually called by BigCalendar
// no-explicit-any: Navigate enums are declared "any" by BigCalendar
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
MultiCalendarsView.navigate = (navigateDate: Date, action: any): Date => {
	switch (action) {
		case Navigate.PREVIOUS:
			return datesAdd(navigateDate, -7, 'day');

		case Navigate.NEXT:
			return datesAdd(navigateDate, 7, 'day');

		default:
			return navigateDate;
	}
};

// no-unused-vars: Actually called by BigCalendar
// eslint-disable-next-line @typescript-eslint/no-unused-vars
MultiCalendarsView.title = (titleDate: Date): string =>
	// const startDate = moment(titleDate).day(start);
	// const endDate = datesAdd(startDate, end - start, 'day');
	// const isMonthSame = moment(startDate).format('MMMM') === moment(endDate).format('MMMM');
	// return isMonthSame
	// 	? `${moment(startDate).format('MMMM DD')} - ${moment(endDate).format('DD')}`
	// 	: ` ${moment(startDate).format('MMMM DD')} - ${moment(endDate).format('MMMM DD')}`;
	'Titolo importante'; // TODO
