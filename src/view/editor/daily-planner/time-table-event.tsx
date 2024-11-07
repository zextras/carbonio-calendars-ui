/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';

import { EventDiv } from './parts/event-div';
import { DailyPlannerFreeBusyEvent } from './types';
import { getEventColor } from './utils';

export const TimeTableEvent = ({
	event
}: {
	event: DailyPlannerFreeBusyEvent;
}): React.JSX.Element => {
	const theme = useTheme();
	return (
		<EventDiv
			dataTestId={event.type}
			key={event.start.minutes}
			startPosition={event.start.hours * 60 + event.start.minutes}
			eventTimeSpan={
				event.end.hours * 60 + event.end.minutes - (event.start.hours * 60 + event.start.minutes)
			}
			color={getEventColor(event.type, theme)}
		/>
	);
};
