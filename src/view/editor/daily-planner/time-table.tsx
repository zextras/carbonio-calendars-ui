/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, useTheme } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { EventDiv } from './parts/event-div';
import { MinutesLine } from './parts/minutes-line';
import { TimetableHeader } from './time-table-header';
import { TimeTableProps } from './types';
import { getEventColor, getLocalHoursMinutesFromEpoch, parseFreeBusyEvent } from './utils';

const TimeTableRow = styled.div`
	height: 2rem;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
`;
const EmailColumn = styled.div`
	display: flex;
	align-items: center;
	min-width: 10rem;
	padding-right: 2rem;
`;
const FreeBusyColumn = styled.div`
	width: 100%;
	position: relative;
	border: 1px solid #d3d3d3;
	height: 2rem;
`;

export const TimeTable = ({
	appointmentStartDate,
	appointmentEndDate,
	rows
}: TimeTableProps): React.JSX.Element => {
	const { hours: startHours, minutes: startMinutes } =
		getLocalHoursMinutesFromEpoch(appointmentStartDate);
	const startPosition = startHours * 60 + startMinutes;
	const { hours: endHours, minutes: endMinutes } =
		getLocalHoursMinutesFromEpoch(appointmentEndDate);
	const endPosition = endHours * 60 + endMinutes;
	const theme = useTheme();
	const START_DATE_LINE_COLOR = theme.palette.success.regular;
	const END_DATE_LINE_COLOR = theme.palette.error.regular;
	const hourTicks = Array.from(
		{ length: 25 },
		(index, hour): React.JSX.Element => (
			<MinutesLine key={`${hour}`} width={'1px'} atPosition={60 * hour} color={'#d3d3d3'} />
		)
	);

	const rowDivs = rows.map((row, index) => {
		const parsedEvents = row?.freeBusy?.map((event) => parseFreeBusyEvent(event));
		const eventDivs = parsedEvents?.map((parsedEvent) => (
			<EventDiv
				dataTestId={parsedEvent.type}
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
			<TimeTableRow key={`row-${index}`} data-testid={`row-${index}`}>
				<EmailColumn data-testid={`column-0`}>
					<Chip maxWidth={'10rem'} key={'organizer'} label={`${row.email}`} />
				</EmailColumn>
				<FreeBusyColumn data-testid={`column-1`}>
					{eventDivs}
					{hourTicks}
					<MinutesLine
						dataTestId={'start-mark'}
						atPosition={startPosition}
						color={START_DATE_LINE_COLOR}
					/>
					<MinutesLine atPosition={endPosition} color={END_DATE_LINE_COLOR} />
				</FreeBusyColumn>
			</TimeTableRow>
		);
	});

	return (
		<div style={{ width: '100%', position: 'relative' }} data-testid={'time-table'}>
			<TimeTableRow key={`row-header`} data-testid={`row-header`}>
				<EmailColumn data-testid={`column-header-0`} />
				<div style={{ width: '100%', position: 'relative' }} data-testid={`column-header-1`}></div>
			</TimeTableRow>
			<TimetableHeader />
			{rowDivs}
		</div>
	);
};
