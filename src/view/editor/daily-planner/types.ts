/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DAILY_PLANNER_EVENT_TYPE, DAILY_PLANNER_PARTICIPANT_TYPE } from './constants';

export type DailyPlannerEventType =
	(typeof DAILY_PLANNER_EVENT_TYPE)[keyof typeof DAILY_PLANNER_EVENT_TYPE];

export type DailyPlannerParticipantType =
	(typeof DAILY_PLANNER_PARTICIPANT_TYPE)[keyof typeof DAILY_PLANNER_PARTICIPANT_TYPE];

export type DailyPlannerEvents = {
	type: DailyPlannerEventType;
	startDateEpochMillis: number;
	endDateEpochMillis: number;
};

export type HoursMinutes = { hours: number; minutes: number };

export type DailyPlannerRow = {
	email: string;
	participantType: DailyPlannerParticipantType;
	events: DailyPlannerEvents[];
	fullName?: string;
};

export type TimeTableProps = {
	appointmentStartDate: number;
	appointmentEndDate: number;
	rows: DailyPlannerRow[];
};
