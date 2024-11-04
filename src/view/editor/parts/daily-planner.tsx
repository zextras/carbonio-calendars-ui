/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container, Padding, Row, useTheme } from '@zextras/carbonio-design-system';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEnd, selectEditorStart, selectSender } from '../../../store/selectors/editor';

type TimeTableProps = {
	startDate: number;
	endDate: number;
	events: Event[];
};

type EventType = 'free' | 'busy' | 'tentative' | 'out-of-office' | 'unknown';

type Event = {
	type: EventType;
	startDate: number;
	endDate: number;
};
type HoursMinutes = { hours: number; minutes: number };
type ParsedEvent = { type: EventType; start: HoursMinutes; end: HoursMinutes };

function getHourFromDateTime(dateTime: number): HoursMinutes {
	const date = new Date(dateTime);
	return { hours: date.getHours(), minutes: date.getMinutes() };
}

function calculatePosition(minutes: number): string {
	const width = (minutes * 100) / (60 * 24);
	return `${width}%`;
}

function calculateEventWidth(minutes: number): string {
	const width = (minutes * 100) / (60 * 24);
	return `${width}%`;
}

function parseEvent(event: Event): ParsedEvent {
	return {
		type: event.type,
		start: getHourFromDateTime(event.startDate),
		end: getHourFromDateTime(event.endDate)
	};
}
const HourLabel = ({
	label,
	atPosition
}: {
	atPosition: number;
	label: string;
}): React.JSX.Element => (
	<Container
		style={{
			width: '3px',
			height: '2rem',
			borderRadius: 'none',
			float: 'left',
			position: 'absolute',
			left: calculatePosition(atPosition)
		}}
	>
		{label}
	</Container>
);

const MinutesLine = ({
	atPosition,
	color,
	width = '3px'
}: {
	atPosition: number;
	color: string;
	width?: string;
}): React.JSX.Element => (
	<div
		style={{
			width,
			backgroundColor: color,
			height: '2rem',
			borderRadius: 'none',
			float: 'left',
			position: 'absolute',
			left: calculatePosition(atPosition)
		}}
	/>
);

const EventDiv = ({
	startPosition,
	eventTimeSpan,
	color
}: {
	startPosition: number;
	eventTimeSpan: number;
	color: string;
}): React.JSX.Element => (
	<div
		style={{
			width: calculateEventWidth(eventTimeSpan),
			backgroundColor: color,
			height: '2rem',
			// borderRadius: 'none',
			float: 'left',
			position: 'absolute',
			left: calculatePosition(startPosition)
		}}
	/>
);

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
function getRandomColor(): string {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
const TimeTable = ({ startDate, endDate, events }: TimeTableProps): React.JSX.Element => {
	const { hours: startHours, minutes: startMinutes } = getHourFromDateTime(startDate);
	const startPosition = startHours * 60 + startMinutes;
	const { hours: endHours, minutes: endMinutes } = getHourFromDateTime(endDate);
	const endPosition = endHours * 60 + endMinutes;
	const theme = useTheme();
	const START_DATE_LINE_COLOR = theme.palette.success.regular;
	const END_DATE_LINE_COLOR = theme.palette.error.regular;
	const parsedEvents = events.map((event) => parseEvent(event));
	const hourTicks = Array.from(
		{ length: 25 },
		(_, hour): React.JSX.Element => (
			<MinutesLine key={hour} width={'1px'} atPosition={60 * hour} color={'#d3d3d3'} />
		)
	);

	const eventDivs = parsedEvents.map((parsedEvent) => (
		<EventDiv
			key={parsedEvent.start.minutes}
			startPosition={parsedEvent.start.hours * 60 + parsedEvent.start.minutes}
			eventTimeSpan={
				parsedEvent.end.hours * 60 +
				parsedEvent.end.minutes -
				(parsedEvent.start.hours * 60 + parsedEvent.start.minutes)
			}
			color={getRandomColor()}
		/>
	));

	return (
		<div
			style={{ width: '100%', position: 'relative', height: '2rem', border: '1px solid #d3d3d3' }}
		>
			{hourTicks}
			{eventDivs}
			<MinutesLine atPosition={startPosition} color={START_DATE_LINE_COLOR} />
			<MinutesLine atPosition={endPosition} color={END_DATE_LINE_COLOR} />
		</div>
	);
};

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const sender = useAppSelector(selectSender(editorId));

	const startDate = useAppSelector(selectEditorStart(editorId)) as number;
	const endDate = useAppSelector(selectEditorEnd(editorId)) as number;

	// Test event at 12:50 - 12:55 CEST, 11:50 - 11:55 GMT
	const events: Array<Event> = [
		{
			startDate: new Date(2024, 11, 4, 10, 0).getTime(),
			endDate: new Date(2024, 11, 4, 11, 0).getTime(),
			type: 'busy'
		},
		{
			startDate: new Date(2024, 11, 4, 12, 0).getTime(),
			endDate: new Date(2024, 11, 4, 12, 45).getTime(),
			type: 'busy'
		},
		{
			startDate: new Date(2024, 11, 4, 12, 15).getTime(),
			endDate: new Date(2024, 11, 4, 12, 30).getTime(),
			type: 'busy'
		}
	];
	const participantName = sender.fullName ?? '';

	return (
		<Row
			orientation={'horizontal'}
			width="fill"
			mainAlignment={'flex-start'}
			style={{ flexWrap: 'nowrap' }}
		>
			<Row orientation={'vertical'} padding={{ right: '1rem', vertical: '1rem' }}>
				<Padding top={'2rem'} />
				<Chip maxWidth={'10rem'} key={'organizer'} label={`${participantName}`} />
			</Row>
			<Row orientation={'vertical'} width="fill" padding={{ right: '1rem', vertical: '1rem' }}>
				<TimetableHeader />
				<TimeTable startDate={startDate} endDate={endDate} events={events} />
			</Row>
		</Row>
	);
};
