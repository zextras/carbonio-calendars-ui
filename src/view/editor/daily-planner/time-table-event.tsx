/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { EventDiv } from './parts/event-div';
import { DailyPlannerEvents, DailyPlannerEventType } from './types';
import { getEventColor, getEventLabel, getLocalHoursMinutesFromEpoch } from './utils';

function doubleDigitMinutes(minutes: number): string {
	const asLabel = `${minutes}`;
	if (asLabel.length === 1) {
		return `0${minutes}`;
	}
	return asLabel;
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

export const TimeTableEvent = ({ event }: { event: DailyPlannerEvents }): React.JSX.Element => {
	const theme = useTheme();
	const startHoursMinutes = getLocalHoursMinutesFromEpoch(event.startDateEpochMillis);
	const endHoursMinutes = getLocalHoursMinutesFromEpoch(event.endDateEpochMillis);
	const timeSpan = (event.endDateEpochMillis - event.startDateEpochMillis) / (1000 * 60);

	const [t] = useTranslation();
	const statusLabel = t('daily_planner.status', 'Status');
	const fromLabel = t('daily_planner.from', 'from');
	const toLabel = t('daily_planner.to', 'to');
	let tooltipLabel = `${statusLabel}: ${getEventLabel(event.type, t)}`;
	if (shouldShowHours(event.type)) {
		const startHoursHuman = `${startHoursMinutes.hours}:${doubleDigitMinutes(startHoursMinutes.minutes)}`;
		const endHoursHuman = `${endHoursMinutes.hours}:${doubleDigitMinutes(endHoursMinutes.minutes)}`;
		tooltipLabel = `${statusLabel}: ${getEventLabel(event.type, t)} ${fromLabel} ${startHoursHuman} ${toLabel} ${endHoursHuman}`;
	}

	return (
		<EventDiv
			dataTestId={event.type}
			startPosition={startHoursMinutes.hours * 60 + startHoursMinutes.minutes}
			eventTimeSpan={timeSpan}
			tooltipLabel={tooltipLabel}
			color={getEventColor(event.type, theme)}
		/>
	);
};
