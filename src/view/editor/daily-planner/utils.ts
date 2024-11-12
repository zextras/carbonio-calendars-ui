/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Theme } from '@zextras/carbonio-design-system';

import { DAILY_PLANNER_PARTICIPANT_TYPE } from './constants';
import { DailyPlannerEventType, HoursMinutes, DailyPlannerParticipantType } from './types';

export function getEventColor(type: DailyPlannerEventType, theme: Theme): string {
	switch (type) {
		case 'free':
			return theme.palette.gray6.regular;
		case 'busy':
			return theme.palette.highlight.regular;
		case 'tentative':
			return theme.palette.warning.regular;
		case 'out-of-office':
			return theme.palette.primary.active;
		case 'non-working':
			return theme.palette.gray5.regular;
		case 'unknown':
			return theme.palette.gray4.disabled;
		default:
			return theme.palette.success.regular;
	}
}

export function getParticipantIcon(type: DailyPlannerParticipantType): string {
	switch (type) {
		case DAILY_PLANNER_PARTICIPANT_TYPE.organizer:
		case DAILY_PLANNER_PARTICIPANT_TYPE.attendee:
			return 'Person';
		case DAILY_PLANNER_PARTICIPANT_TYPE.meetingRoom:
			return 'Building';
		case DAILY_PLANNER_PARTICIPANT_TYPE.equipment:
			return 'Briefcase';
		case DAILY_PLANNER_PARTICIPANT_TYPE.optionalAttendee:
		default:
			return 'PersonOutline';
	}
}

export function getLocalHoursMinutesFromEpoch(epochMillis: number): HoursMinutes {
	const date = new Date(epochMillis);
	return { hours: date.getHours(), minutes: date.getMinutes() };
}

export function calculatePosition(minutes: number): string {
	const width = (minutes * 100) / (60 * 24);
	return `${width}%`;
}

export function calculateEventWidth(minutes: number): string {
	const width = (minutes * 100) / (60 * 24);
	return `${width}%`;
}

export function getDefaultLineColors(theme: Theme): { start: string; end: string } {
	const start = theme.palette.success.regular;
	const end = theme.palette.error.regular;
	return { start, end };
}
