/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import {
	Chip,
	Container,
	Table,
	THeaderProps,
	TRowProps,
	useTheme
} from '@zextras/carbonio-design-system';
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

const RowFactory = ({ row }: TRowProps): React.JSX.Element => (
	<tr style={{ height: '2rem' }}>
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

function getHourFromDateTime(dateTime: number): { hours: number; minutes: number } {
	const date = new Date(dateTime);
	return { hours: date.getHours(), minutes: date.getMinutes() };
}

function calculatePosition(minutes: number): string {
	const width = (minutes * 100) / 60;
	return `${width}%`;
}

function useParticipantColumns({
	participantName,
	startDate,
	endDate
}: GetParticipantColumnsProps): Array<React.JSX.Element> {
	const { hours: startHours, minutes: startMinutes } = getHourFromDateTime(startDate);
	const { hours: endHours, minutes: endMinutes } = getHourFromDateTime(endDate);
	const theme = useTheme();
	const START_DATE_LINE_COLOR = theme.palette.success.regular;
	const END_DATE_LINE_COLOR = theme.palette.error.regular;
	return [
		<Chip maxWidth={'10rem'} key={'organizer'} label={`${participantName}`} />,
		...Array.from({ length: 25 }, (_, hour) => {
			const matchesStartHour = hour === startHours;
			const matchesEndHour = hour === endHours;
			return (
				<div style={{ height: '2rem' }} key={startHours}>
					{matchesStartHour && (
						<Container
							width="3px"
							background={START_DATE_LINE_COLOR}
							height={'fill'}
							borderRadius={'none'}
							style={{
								float: 'left',
								position: 'relative',
								left: calculatePosition(startMinutes)
							}}
						/>
					)}
					{matchesEndHour && (
						<Container
							width="3px"
							borderRadius={'none'}
							background={END_DATE_LINE_COLOR}
							height={'fill'}
							style={{
								float: 'left',
								position: 'relative',
								left: calculatePosition(endMinutes)
							}}
						/>
					)}
				</div>
			);
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

	const organizerColumns = useParticipantColumns({
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
