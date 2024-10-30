/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container, Table, THeaderProps, TRowProps } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectSender } from '../../../store/selectors/editor';

const StyledTable = styled(Table)`
	thead {
		&,
		th {
			background-color: transparent;
	}
`;

function getBorderWidth(index: number): string {
	if (index < 2) return '0px';
	if (index > 49) return '0px';
	if (index % 2 === 0) return '1px 0 1px 1px';
	return '1px 1px 1px 0';
}

const RowFactory = ({ row }: TRowProps): React.JSX.Element => (
	<tr>
		{row.columns.map((column, index) => (
			<td
				key={index}
				style={{
					borderWidth: getBorderWidth(index),
					borderColor: 'black',
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

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const hours = [
		'12',
		...Array.from({ length: 11 }, (_, i) => (i + 1).toString()),
		'12',
		...Array.from({ length: 11 }, (_, i) => (i + 1).toString()),
		'12'
	];

	const sender = useAppSelector(selectSender(editorId));
	const columns = [
		<Chip
			maxWidth={'10rem'}
			key={'organizer'}
			label={`${
				sender.fullName
			}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
		/>,
		...Array.from({ length: 50 }, (_, index) => <div key={index} />)
	];

	const rows = [
		{
			id: 'organizer',
			columns,
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
