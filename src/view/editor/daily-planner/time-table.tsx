/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import styled from '@emotion/styled';
import { map } from 'lodash';

import { TimetableHeader } from './time-table-header';
import { TimeTableLegend } from './time-table-legend';
import { TimeTableParticipantRow } from './time-table-participant-row';
import { TimeTableProps } from './types';

const TimeTableRow = styled.div`
	height: 2rem;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
`;

const TimeTableLegendRow = styled.div`
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

const EmptyColumn = styled.div`
	display: flex;
	align-items: center;
	min-width: 10rem;
	padding-right: 2rem;
`;

export const TimeTable = ({
	appointmentStartDate,
	appointmentEndDate,
	rows
}: TimeTableProps): React.JSX.Element => (
	<div style={{ width: '100%', position: 'relative' }} data-testid={'time-table'}>
		<TimeTableRow key={`row-header`} data-testid={`row-header`}>
			<EmailColumn data-testid={`column-header-0`} />
			<div style={{ width: '100%', position: 'relative' }} data-testid={`column-header-1`}>
				<TimetableHeader />
			</div>
		</TimeTableRow>
		{map(rows, (row, index) => {
			const key = `row-${row.email}-${index}`;
			return (
				<TimeTableParticipantRow
					key={key}
					participantRow={row}
					startTimeEpochMillis={appointmentStartDate}
					endTimeEpochMillis={appointmentEndDate}
				/>
			);
		})}
		<TimeTableLegendRow key={`row-legend`} data-testid={`row-legend`}>
			<EmptyColumn data-testid={`column-legend-0`} />
			<div style={{ width: '100%', position: 'relative' }} data-testid={`column-legend-1`}>
				<TimeTableLegend />
			</div>
		</TimeTableLegendRow>
	</div>
);
