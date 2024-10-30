/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container, Table, THeaderProps, TRowProps } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEnd, selectEditorStart, selectSender } from '../../../store/selectors/editor';

const StyledTable = styled(Table)`
	thead {
		&,
		th {
			background-color: transparent;
	}
`;

const START_DATE_LINE_COLOR = 'green';
const END_DATE_LINE_COLOR = 'red';

function getBorderWidth(index: number): string {
	if (index < 2) return '0px';
	if (index > 49) return '0px';
	if (index % 2 === 0) return '1px 0 1px 1px';
	return '1px 1px 1px 0';
}

function getBorderColor(): string {
	return 'black';
}

const RowFactory = ({ row }: TRowProps): React.JSX.Element => (
	<tr>
		{row.columns.map((column, index) => (
			<td
				key={index}
				style={{
					borderWidth: getBorderWidth(index),
					borderColor: getBorderColor(),
					borderStyle: 'solid',
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
				colSpan={index === 0 ? 1 : 2}
				key={index}
				style={{
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

type GetParticipantColumnsProps = {
	participantName: string;
	startDate: number;
	endDate: number;
};

function getParticipantColumns({
	participantName,
	startDate,
	endDate
}: GetParticipantColumnsProps): React.JSX.Element[] {
	return [
		<Chip maxWidth={'10rem'} key={'organizer'} label={`${participantName}`} />,
		...Array.from({ length: 50 }, (_, slot) => {
			// get start date hour
			// startDate: epoch millis

			if (slot !== 0 && slot !== 50) {
				const startDateLocalTime = new Date(startDate);
				const startHour = startDateLocalTime.getHours() + 1;
				const startMinutes = startDateLocalTime.getMinutes();
				const last30MinutesSlot = slot % 2 === 0;
				// slot: 1-49
				let currentHour;
				if (last30MinutesSlot) {
					currentHour = (slot * 30) / 60;
				} else {
					currentHour = ((slot + 1) * 30) / 60;
				}

				const inCurrentHour = startHour === currentHour;
				const startDateMinutesInSecondSlot = startMinutes > 30;
				if (inCurrentHour) {
					if (last30MinutesSlot && startDateMinutesInSecondSlot) {
						console.log(`CurrentHour: ${currentHour}`);
						return <div key={startHour} style={{ height: '100px', backgroundColor: 'red' }} />;
					}
					if (!last30MinutesSlot && !startDateMinutesInSecondSlot) {
						return <div key={startHour} style={{ height: '100px', backgroundColor: 'red' }} />;
					}
				}
			}
			return <div key={slot} />;
		})
	];
}

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const hours = [
		'12',
		...Array.from({ length: 11 }, (_, i) => (i + 1).toString()),
		'12',
		...Array.from({ length: 11 }, (_, i) => (i + 1).toString()),
		'12'
	];

	const sender = useAppSelector(selectSender(editorId));

	const startDate = useAppSelector(selectEditorStart(editorId)) as number;
	const endDate = useAppSelector(selectEditorEnd(editorId)) as number;

	const organizerColumns = getParticipantColumns({
		participantName: sender.fullName ?? '',
		startDate,
		endDate
	});

	const rows = [
		{
			id: 'organizer',
			columns: organizerColumns,
			highlight: false
		}
	];
	return (
		<Container data-testid={`daily-planner-component-${editorId}`}>
			<StyledTable
				RowFactory={RowFactory}
				HeaderFactory={HeaderFactory}
				style={{ padding: 0, borderSpacing: 0, backgroundColor: 'transparent' }}
				showCheckbox={false}
				headers={[
					{ id: 'organizer', label: '' },
					...hours.map((hour) => ({ id: hour, label: hour, colSpan: 2 }))
				]}
				rows={rows}
			/>
		</Container>
	);
};
