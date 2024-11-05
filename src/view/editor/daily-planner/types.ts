/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DAILY_PLANNER_FREE_BUSY_TYPE } from './constants';

export type DailyPlannerFreeBusyType =
	(typeof DAILY_PLANNER_FREE_BUSY_TYPE)[keyof typeof DAILY_PLANNER_FREE_BUSY_TYPE];

export type DailyPlannerFreeBusy = {
	type: DailyPlannerFreeBusyType;
	startDate: number;
	endDate: number;
};
export type HoursMinutes = { hours: number; minutes: number };
export type DailyPlannerFreeBusyEvent = {
	type: DailyPlannerFreeBusyType;
	start: HoursMinutes;
	end: HoursMinutes;
};

export type DailyPlannerRow = { email: string; freeBusy: DailyPlannerFreeBusy[] };

export type TimeTableProps = {
	appointmentStartDate: number;
	appointmentEndDate: number;
	rows: DailyPlannerRow[];
};
