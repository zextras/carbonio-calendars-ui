/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container, Padding, Row, Theme, useTheme } from '@zextras/carbonio-design-system';

import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAttendees,
	selectEditorEnd,
	selectEditorStart,
	selectSender
} from '../../../store/selectors/editor';

type TimeTableProps = {
	startDate: number;
	endDate: number;
	attendeesFB: Array<AttendeeFreeBusy>;
};

type EventType = 'free' | 'busy' | 'tentative' | 'out-of-office' | 'unknown';

type Event = {
	type: EventType;
	startDate: number;
	endDate: number;
};
type HoursMinutes = { hours: number; minutes: number };
type ParsedEvent = { type: EventType; start: HoursMinutes; end: HoursMinutes };

type AttendeeFreeBusy = { attendee: string; events: Array<Event> };

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

function getEventColor(type: EventType, theme: Theme): string {
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

const TimeTable = ({ startDate, endDate, attendeesFB }: TimeTableProps): React.JSX.Element => {
	const { hours: startHours, minutes: startMinutes } = getHourFromDateTime(startDate);
	const startPosition = startHours * 60 + startMinutes;
	const { hours: endHours, minutes: endMinutes } = getHourFromDateTime(endDate);
	const endPosition = endHours * 60 + endMinutes;
	const theme = useTheme();
	const START_DATE_LINE_COLOR = theme.palette.success.regular;
	const END_DATE_LINE_COLOR = theme.palette.error.regular;
	const parsedEvents = attendeesFB?.[0]?.events?.map((event) => parseEvent(event));
	const hourTicks = Array.from(
		{ length: 25 },
		(_, hour): React.JSX.Element => (
			<MinutesLine key={hour} width={'1px'} atPosition={60 * hour} color={'#d3d3d3'} />
		)
	);

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
	const senderWithEmail = {
		...sender,
		email: sender.address as string
	};

	const attendees = useAppSelector(selectEditorAttendees(editorId));

	const startDate = useAppSelector(selectEditorStart(editorId)) as number;
	const endDate = useAppSelector(selectEditorEnd(editorId)) as number;
	const allFreeBusy = useAttendeesAvailability(startDate, [senderWithEmail, ...attendees]);

	const attendeesFB = allFreeBusy?.map((attendeeFb) => {
		const eventsFree = attendeeFb.f.map((event) => ({
			startDate: event.s,
			endDate: event.e,
			type: 'free' as EventType
		}));
		const eventsBusy = attendeeFb.b.map((event) => ({
			startDate: event.s,
			endDate: event.e,
			type: 'busy' as EventType
		}));
		const eventsTentative = attendeeFb.t.map((event) => ({
			startDate: event.s,
			endDate: event.e,
			type: 'tentative' as EventType
		}));
		return {
			attendee: attendeeFb.email,
			events: [...eventsFree, ...eventsBusy, ...eventsTentative]
		};
	});

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
				<TimeTable startDate={startDate} endDate={endDate} attendeesFB={attendeesFB ?? []} />
			</Row>
		</Row>
	);
};
