/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container, Icon, useTheme } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DAILY_PLANNER_PARTICIPANT_TYPE } from './constants';
import { MinutesLine } from './parts/minutes-line';
import { TimeTableEvent } from './time-table-event';
import { TimeTableHourTicks } from './time-table-hour-ticks';
import { DailyPlannerRow, HoursMinutes } from './types';
import { getDefaultLineColors, getParticipantIcon, parseFreeBusyEvent } from './utils';

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
	const [t] = useTranslation();
	const theme = useTheme();
	const defaultLineColors = getDefaultLineColors(theme);
	const startPosition = start.hours * 60 + start.minutes;
	const endPosition = end.hours * 60 + end.minutes;
	const parsedEvents = participantRow?.events?.map((event) => parseFreeBusyEvent(event));
	const chipLabel =
		participantRow.participantType === DAILY_PLANNER_PARTICIPANT_TYPE.organizer
			? `${t('daily_planner.organizer', 'Organizer')} - ${participantRow.email}`
			: participantRow.email;

	return (
		<TimeTableRow data-testid={`row-${participantRow.email}`}>
			<EmailColumn data-testid={`column-0`}>
				<Container width={'2rem'} minWidth={'2rem'} maxWidth={'2rem'}>
					<Icon
						width={'2rem'}
						size={'large'}
						color={'primary'}
						icon={getParticipantIcon(participantRow.participantType)}
					/>
				</Container>
				<Chip maxWidth={'10rem'} label={chipLabel} />
			</EmailColumn>
			<FreeBusyColumn data-testid={`column-1`}>
				{map(parsedEvents, (event, index) => (
					<TimeTableEvent event={event} key={`${participantRow.email}-${event.type}-${index}`} />
				))}
				<TimeTableHourTicks />
				<MinutesLine
					dataTestId={'start-mark'}
					atPosition={startPosition}
					color={defaultLineColors.start}
				/>
				<MinutesLine atPosition={endPosition} color={defaultLineColors.end} />
			</FreeBusyColumn>
		</TimeTableRow>
	);
};
