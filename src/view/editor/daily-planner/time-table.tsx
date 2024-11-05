/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, useTheme } from '@zextras/carbonio-design-system';

import { EventDiv } from './parts/event-div';
import { HourLabel } from './parts/hour-label';
import { MinutesLine } from './parts/minutes-line';
import { TimeTableProps } from './types';
import { getEventColor, getHourFromDateTime, parseEvent } from './utils';

const TimetableHeader = (): React.JSX.Element => {
	const hours = [
		'12',
		...Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
		...Array.from({ length: 12 }, (_, i) => (i + 1).toString())
	];
	return (
		<div style={{ width: '100%', position: 'relative', height: '2rem' }}>
			{hours.map((label, hour) => (
				<HourLabel key={hour} label={label} atPosition={60 * hour} />
			))}
		</div>
	);
};

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

	const rowDivs = rows.map((row, index) => {
		const parsedEvents = row?.freeBusy?.map((event) => parseEvent(event));
		const eventDivs = parsedEvents?.map((parsedEvent) => (
			<EventDiv
				key={parsedEvent.start.minutes}
				startPosition={parsedEvent.start.hours * 60 + parsedEvent.start.minutes}
				eventTimeSpan={
					parsedEvent.end.hours * 60 +
					parsedEvent.end.minutes -
					(parsedEvent.start.hours * 60 + parsedEvent.start.minutes)
				}
				color={getEventColor(parsedEvent.type, theme)}
			/>
		));
		return (
			// TODO: consider using Row with orientation={'horizontal'}
			// Then we need two rows with orientation 'vertical' (the two columns). The second column
			// must include position relative in order to correctly draw hour and ticks
			<div
				key={`row-${index}`}
				data-testid={`row-${index}`}
				style={{
					height: '2rem',
					display: 'flex',
					flexDirection: 'row',
					flexWrap: 'nowrap',
					border: '1px solid #d3d3d3'
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						minWidth: '10rem'
					}}
					data-testid={`column-0`}
				>
					<Chip maxWidth={'10rem'} key={'organizer'} label={`${row.email}`} />
				</div>
				<div style={{ width: '100%', position: 'relative' }} data-testid={`column-1`}>
					{eventDivs}
					{hourTicks}
					<MinutesLine
						dataTestId={'start-mark'}
						atPosition={startPosition}
						color={START_DATE_LINE_COLOR}
					/>
					<MinutesLine atPosition={endPosition} color={END_DATE_LINE_COLOR} />
				</div>
			</div>
		);
	});

	return (
		<div style={{ width: '100%', position: 'relative' }} data-testid={'time-table'}>
			<div
				style={{
					height: '2rem',
					display: 'flex',
					flexDirection: 'row',
					flexWrap: 'nowrap'
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center'
					}}
					data-testid={`column-0`}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							minWidth: '10rem'
						}}
						data-testid={`column-0`}
					/>
				</div>
				<div style={{ width: '100%', position: 'relative' }} data-testid={`column-1`}>
					<TimetableHeader />
				</div>
			</div>
			{rowDivs}
		</div>
	);
};
