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

const RowFactory = ({ row }: TRowProps): React.JSX.Element => (
	<tr>
		{row.columns.map((column, index) => (
			<td
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

type GetParticipantColumnsProps = {
	participantName: string;
	startDate: number;
	endDate: number;
};

function getHourFromDateTime(dateTime: number): number {
	const date = new Date(dateTime);
	return date.getHours();
}

function getParticipantColumns({
	participantName,
	startDate,
	endDate
}: GetParticipantColumnsProps): React.JSX.Element[] {
	return [
		<Chip maxWidth={'10rem'} key={'organizer'} label={`${participantName}`} />,
		...Array.from({ length: 25 }, (_, hour) => {
			const startDateHour = getHourFromDateTime(startDate);
			if (hour === startDateHour) return <div key={startDateHour}> </div>;
			return <div key={hour} />;
		})
	];
}

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const hours = [
		'12',
		...Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
		...Array.from({ length: 12 }, (_, i) => (i + 1).toString())
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
					...hours.map((hour) => ({ id: hour, label: hour }))
				]}
				rows={rows}
			/>
		</Container>
	);
};
