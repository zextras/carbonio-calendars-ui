/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import {
	Chip,
	Container,
	Text,
	Row,
	THeaderProps,
	TRowProps,
	useTheme
} from '@zextras/carbonio-design-system';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEnd, selectEditorStart, selectSender } from '../../../store/selectors/editor';

const RowFactory = ({ row }: TRowProps): React.JSX.Element => (
	<tr style={{ height: '2rem' }}>
		{row.columns.map((column, index) => (
			<td
				colSpan={index > 0 ? 24 : 1}
				key={index}
				style={{
					border: index > 0 ? '1px solid black' : '0px',
					borderRadius: 0,
					padding: 0
				}}
			>
				{column}
			</td>
		))}
	</tr>
);

const HeaderFactory = ({ headers }: THeaderProps): React.JSX.Element => (
	<tr>
		{headers.map((header, index) => (
			<th
				key={index}
				style={{
					transform: 'translateX(-50%)',
					width: index < 1 ? '10rem' : 'fit-content',
					border: '0px',
					padding: 0,
					textAlign: 'center',
					fontWeight: 'normal'
				}}
			>
				{header.label}
			</th>
		))}
	</tr>
);

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

function parseEvent(event: Event): ParsedEvent {
	return {
		type: event.type,
		start: getHourFromDateTime(event.startDate),
		end: getHourFromDateTime(event.endDate)
	};
}

const MinutesLine = ({
	atPosition,
	color,
	width = '3px'
}: {
	atPosition: number;
	color: string;
	width?: string;
}): React.JSX.Element => (
	<Container
		width={width}
		background={color}
		height={'2rem'}
		borderRadius={'none'}
		// style={{
		// 	float: 'left',
		// 	position: 'relative',
		// 	left: calculatePosition(atPosition)
		// }}
	/>
);
const TimetableHeader = (): React.JSX.Element => {
	const hours = [
		'12',
		...Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
		...Array.from({ length: 12 }, (_, i) => (i + 1).toString())
	];
	return (
		<Row style={{ justifyContent: 'space-between' }} width="fill">
			{hours.map((hour) => (
				<Text key={hour} style={{ width: '2rem' }} textAlign="center">
					{hour}
				</Text>
			))}
		</Row>
	);
};

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
		<MinutesLine
			key={parsedEvent.start.minutes}
			atPosition={parsedEvent.start.hours * 60 + parsedEvent.start.minutes}
			color={'blue'}
		/>
	));

	return (
		<Row style={{ justifyContent: 'space-between' }} width="fill">
			{hourTicks}
			{/* {eventDivs} */}
			{/* <MinutesLine atPosition={startPosition} color={START_DATE_LINE_COLOR} /> */}
			{/* <MinutesLine atPosition={endPosition} color={END_DATE_LINE_COLOR} /> */}
		</Row>
	);
};

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const sender = useAppSelector(selectSender(editorId));

	const startDate = useAppSelector(selectEditorStart(editorId)) as number;
	const endDate = useAppSelector(selectEditorEnd(editorId)) as number;

	const events: Array<Event> = [{ startDate: 1730375433000, endDate: 1730375733000, type: 'busy' }];
	const participantName = sender.fullName ?? '';

	return (
		<Row
			orientation={'horizontal'}
			width="fill"
			mainAlignment={'flex-start'}
			style={{ flexWrap: 'nowrap' }}
		>
			<Chip maxWidth={'10rem'} key={'organizer'} label={`${participantName}`} />
			<Row orientation={'vertical'} width="fill">
				<TimetableHeader />
				<TimeTable startDate={startDate} endDate={endDate} events={events} />
			</Row>
		</Row>
	);
};
