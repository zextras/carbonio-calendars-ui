/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Theme } from '@zextras/carbonio-design-system';

import { DailyPlannerFreeBusy, DailyPlannerFreeBusyType, HoursMinutes, ParsedEvent } from './types';

export function getEventColor(type: DailyPlannerFreeBusyType, theme: Theme): string {
	switch (type) {
		case 'free':
			return theme.palette.gray6.regular;
		case 'busy':
			return theme.palette.highlight.regular;
		case 'tentative':
			return theme.palette.warning.regular;
		case 'out-of-office':
			return theme.palette.primary.active;
		case 'unknown':
			return theme.palette.gray4.disabled;
		default:
			return theme.palette.success.regular;
	}
}

export function getLocalHoursMinutesFromEpoch(epochMillis: number): HoursMinutes {
	const date = new Date(epochMillis);
	return { hours: date.getHours(), minutes: date.getMinutes() };
}

export function parseEvent(event: DailyPlannerFreeBusy): ParsedEvent {
	return {
		type: event.type,
		start: getLocalHoursMinutesFromEpoch(event.startDate),
		end: getLocalHoursMinutesFromEpoch(event.endDate)
	};
}

export function calculatePosition(minutes: number): string {
	const width = (minutes * 100) / (60 * 24);
	return `${width}%`;
}

export function calculateEventWidth(minutes: number): string {
	const width = (minutes * 100) / (60 * 24);
	return `${width}%`;
}
