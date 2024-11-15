/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Theme } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { map } from 'lodash';

import { DAILY_PLANNER_EVENT_TYPE, DAILY_PLANNER_PARTICIPANT_TYPE } from './constants';
import {
	DailyPlannerEventType,
	HoursMinutes,
	DailyPlannerParticipantType,
	DailyPlannerEvents,
	DailyPlannerRow
} from './types';
import { ParticipantAvailability } from './use-participants-availability';
import { NonWorkingHours } from './use-participants-non-working-hours';

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

export function getEventLabel(type: DailyPlannerEventType, t: TFunction): string {
	switch (type) {
		case 'free':
			return t('daily_planner.free', 'Free');
		case 'busy':
			return t('daily_planner.busy', 'Busy');
		case 'tentative':
			return t('daily_planner.tentative', 'Tentative');
		case 'out-of-office':
			return t('daily_planner.out-of-office', 'Out of office');
		case 'non-working':
			return t('daily_planner.non-working', 'Non-working');
		case 'unknown':
		default:
			return t('daily_planner.unknown', 'Unknown');
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

export function getParticipantLabel(type: DailyPlannerParticipantType, t: TFunction): string {
	switch (type) {
		case DAILY_PLANNER_PARTICIPANT_TYPE.organizer:
			return t('daily_planner.participant.organizer', 'Organizer');
		case DAILY_PLANNER_PARTICIPANT_TYPE.attendee:
			return t('daily_planner.participant.attendee', 'Attendee');
		case DAILY_PLANNER_PARTICIPANT_TYPE.meetingRoom:
			return t('daily_planner.participant.meetingRoom', 'Meeting Room');
		case DAILY_PLANNER_PARTICIPANT_TYPE.equipment:
			return t('daily_planner.participant.equipment', 'Equipment');
		case DAILY_PLANNER_PARTICIPANT_TYPE.optionalAttendee:
			return t('daily_planner.participant.optionalAttendee', 'Optional Attendee');
		default:
			return t('daily_planner.participant.unknown', 'Unknown');
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

export function getHumanReadableHours(timeEpochMillis: number, locale: string): string {
	return new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		minute: 'numeric'
	}).format(timeEpochMillis);
}

function shouldShowHours(eventType: DailyPlannerEventType): boolean {
	switch (eventType) {
		case 'busy':
		case 'tentative':
		case 'out-of-office':
			return true;
		default:
			return false;
	}
}
export function getEventTooltipLabel(
	event: DailyPlannerEvents,
	t: TFunction,
	locale: string
): string {
	const statusLabel = t('daily_planner.status', 'Status');
	const fromLabel = t('daily_planner.from', 'from');
	const toLabel = t('daily_planner.to', 'to');
	let tooltipLabel = `${statusLabel}: ${getEventLabel(event.type, t)}`;
	if (shouldShowHours(event.type)) {
		const startHoursHuman = getHumanReadableHours(event.startDateEpochMillis, locale);
		const endHoursHuman = getHumanReadableHours(event.endDateEpochMillis, locale);
		tooltipLabel = `${statusLabel}: ${getEventLabel(event.type, t)} ${fromLabel} ${startHoursHuman} ${toLabel} ${endHoursHuman}`;
	}
	return tooltipLabel;
}

export function getWithinSameDay(startDate: number, endDate: number): boolean {
	const date1 = new Date(startDate);
	const date2 = new Date(endDate);

	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

function mapEvent(
	event: {
		startDateEpochMillis: number;
		endDateEpochMillis: number;
	},
	eventType: DailyPlannerEventType
): DailyPlannerEvents {
	return {
		...event,
		type: eventType
	};
}

export function mapFreeBusyToDailyPlannerRow({
	email,
	fullName,
	participantType,
	availabilities,
	nonWorkingHours
}: {
	email: string;
	participantType: DailyPlannerParticipantType;
	fullName?: string;
	availabilities: Record<string, ParticipantAvailability>;
	nonWorkingHours: Record<string, NonWorkingHours>;
}): DailyPlannerRow {
	const freeBusy = availabilities?.[email] ?? {
		free: [],
		busy: [],
		tentative: [],
		outOfOffice: [],
		unknown: []
	};
	const nonWorking = map(
		(nonWorkingHours?.[email]?.nonWorkingHours ?? []).map((event) =>
			mapEvent(event, DAILY_PLANNER_EVENT_TYPE.nonWorking)
		)
	);
	const eventsFree = freeBusy.free.map((event) => mapEvent(event, DAILY_PLANNER_EVENT_TYPE.free));
	const eventsBusy = freeBusy.busy.map((event) => mapEvent(event, DAILY_PLANNER_EVENT_TYPE.busy));
	const outOfOffice = freeBusy.outOfOffice.map((event) =>
		mapEvent(event, DAILY_PLANNER_EVENT_TYPE.outOfOffice)
	);
	const unknown = freeBusy.unknown.map((event) =>
		mapEvent(event, DAILY_PLANNER_EVENT_TYPE.unknown)
	);

	const eventsTentative = freeBusy.tentative.map((event) =>
		mapEvent(event, DAILY_PLANNER_EVENT_TYPE.tentative)
	);
	return {
		email,
		fullName,
		participantType,
		events: [
			...eventsFree,
			...nonWorking,
			...unknown,
			...eventsTentative,
			...eventsBusy,
			...outOfOffice
		]
	};
}

export function atMidnight(date: Date): Date {
	const midnight = date;
	midnight.setHours(0, 0, 0, 0);
	return midnight;
}

export function onNextDay(date: Date): Date {
	const nextDay = new Date(date);
	nextDay.setDate(nextDay.getDate() + 1);
	return nextDay;
}
