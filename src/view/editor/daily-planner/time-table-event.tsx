/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';

import { EventDiv } from './parts/event-div';
import { DailyPlannerEvents } from './types';
import { getEventColor, getLocalHoursMinutesFromEpoch } from './utils';

export const TimeTableEvent = ({ event }: { event: DailyPlannerEvents }): React.JSX.Element => {
	const theme = useTheme();
	const startHoursMinutes = getLocalHoursMinutesFromEpoch(event.startDateEpochMillis);
	const timeSpan = (event.endDateEpochMillis - event.startDateEpochMillis) / (1000 * 60);
	return (
		<EventDiv
			dataTestId={event.type}
			startPosition={startHoursMinutes.hours * 60 + startHoursMinutes.minutes}
			eventTimeSpan={timeSpan}
			color={getEventColor(event.type, theme)}
		/>
	);
};
