/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import styled from '@emotion/styled';
import { Chip, Container, Icon, Tooltip } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DAILY_PLANNER_PARTICIPANT_TYPE } from './constants';
import { EndMark } from './parts/end-mark';
import { StartMark } from './parts/start-mark';
import { TimeTableEvent } from './time-table-event';
import { TimeTableHourTicks } from './time-table-hour-ticks';
import { DailyPlannerRow } from './types';
import { getParticipantIcon, getParticipantLabel } from './utils';

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
	max-width: 10rem;
	padding-right: 2rem;
`;
const FreeBusyColumn = styled.div`
	width: 100%;
	position: relative;
	border: 1px solid #d3d3d3;
	height: 2rem;
`;

export const TimeTableParticipantRow = ({
	startTimeEpochMillis,
	endTimeEpochMillis,
	participantRow
}: {
	participantRow: DailyPlannerRow;
	startTimeEpochMillis: number;
	endTimeEpochMillis: number;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const iconTooltipLabel = getParticipantLabel(participantRow.participantType, t);
	const participantDisplayName = participantRow.fullName ?? participantRow.email;
	const chipLabel =
		participantRow.participantType === DAILY_PLANNER_PARTICIPANT_TYPE.organizer
			? `${t('daily_planner.organizer', 'Organizer')} - ${participantDisplayName}`
			: participantDisplayName;

	return (
		<TimeTableRow data-testid={`row-${participantRow.email}`}>
			<EmailColumn data-testid={`column-0`}>
				<Tooltip label={iconTooltipLabel}>
					<Container width={'2rem'} minWidth={'2rem'} maxWidth={'2rem'}>
						<Icon
							width={'2rem'}
							size={'large'}
							color={'primary'}
							icon={getParticipantIcon(participantRow.participantType)}
						/>
					</Container>
				</Tooltip>
				<Chip maxWidth={'10rem'} label={chipLabel} />
			</EmailColumn>
			<FreeBusyColumn data-testid={`column-1`}>
				{map(participantRow.events, (event, index) => (
					<TimeTableEvent event={event} key={`${participantRow.email}-${event.type}-${index}`} />
				))}
				<TimeTableHourTicks />
				<StartMark startTimeEpochMillis={startTimeEpochMillis} />
				<EndMark endTimeEpochMillis={endTimeEpochMillis} />
			</FreeBusyColumn>
		</TimeTableRow>
	);
};
