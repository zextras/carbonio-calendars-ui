/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, useTheme } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import styled from 'styled-components';

import { MinutesLine } from './parts/minutes-line';
import { TimeTableEvent } from './time-table-event';
import { TimeTableHourTicks } from './time-table-hour-ticks';
import { DailyPlannerRow, HoursMinutes } from './types';
import { parseFreeBusyEvent } from './utils';

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

export const TimeTableParticipantRow = ({
	start,
	end,
	participantRow
}: {
	participantRow: DailyPlannerRow;
	start: HoursMinutes;
	end: HoursMinutes;
}): React.JSX.Element => {
	const theme = useTheme();
	const START_DATE_LINE_COLOR = theme.palette.success.regular;
	const END_DATE_LINE_COLOR = theme.palette.error.regular;

	const startPosition = start.hours * 60 + start.minutes;
	const endPosition = end.hours * 60 + end.minutes;
	const parsedEvents = participantRow?.freeBusy?.map((event) => parseFreeBusyEvent(event));

	return (
		<TimeTableRow data-testid={`row-${participantRow.email}`}>
			<EmailColumn data-testid={`column-0`}>
				<Chip maxWidth={'10rem'} key={'organizer'} label={`${participantRow.email}`} />
			</EmailColumn>
			<FreeBusyColumn data-testid={`column-1`}>
				{map(parsedEvents, (event, index) => (
					<TimeTableEvent event={event} key={`${participantRow.email}-${event.type}-${index}`} />
				))}
				<TimeTableHourTicks />
				<MinutesLine
					dataTestId={'start-mark'}
					atPosition={startPosition}
					color={START_DATE_LINE_COLOR}
				/>
				<MinutesLine atPosition={endPosition} color={END_DATE_LINE_COLOR} />
			</FreeBusyColumn>
		</TimeTableRow>
	);
};
