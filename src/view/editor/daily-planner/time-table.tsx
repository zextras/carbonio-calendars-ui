/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';

import { MinutesLine } from './parts/minutes-line';
import { TimeTableProps } from './types';
import { getHourFromDateTime } from './utils';

export const TimeTable = ({
	appointmentStartDate,
	appointmentEndDate,
	rows
}: TimeTableProps): React.JSX.Element => {
	const { hours: startHours, minutes: startMinutes } = getHourFromDateTime(appointmentStartDate);
	const startPosition = startHours * 60 + startMinutes;
	const { hours: endHours, minutes: endMinutes } = getHourFromDateTime(appointmentEndDate);
	const endPosition = endHours * 60 + endMinutes;
	const theme = useTheme();
	const START_DATE_LINE_COLOR = theme.palette.success.regular;
	const END_DATE_LINE_COLOR = theme.palette.error.regular;
	const hourTicks = Array.from(
		{ length: 25 },
		(_, hour): React.JSX.Element => (
			<MinutesLine key={hour} width={'1px'} atPosition={60 * hour} color={'#d3d3d3'} />
		)
	);

	const rowDivs = rows.map((row, index) => (
		<div key={`row-${index}`} data-testid={`row-${index}`}>
			{row.email}
		</div>
	));

	// const parsedEvents = rows?.[0]?.freeBusy?.map((event) => parseEvent(event));
	// const eventDivs = parsedEvents?.map((parsedEvent) => (
	// 	<EventDiv
	// 		key={parsedEvent.start.minutes}
	// 		startPosition={parsedEvent.start.hours * 60 + parsedEvent.start.minutes}
	// 		eventTimeSpan={
	// 			parsedEvent.end.hours * 60 +
	// 			parsedEvent.end.minutes -
	// 			(parsedEvent.start.hours * 60 + parsedEvent.start.minutes)
	// 		}
	// 		color={getEventColor(parsedEvent.type, theme)}
	// 	/>
	// ));

	return (
		<div
			style={{ width: '100%', position: 'relative', height: '2rem', border: '1px solid #d3d3d3' }}
			data-testid={'time-table'}
		>
			{rowDivs}
			{hourTicks}
			<MinutesLine
				data-testid={'start-mark'}
				atPosition={startPosition}
				color={START_DATE_LINE_COLOR}
			/>
			<MinutesLine atPosition={endPosition} color={END_DATE_LINE_COLOR} />
			{hourTicks}
		</div>
	);
};
