/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container, Table, TRowProps } from '@zextras/carbonio-design-system';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectSender } from '../../../store/selectors/editor';

const RowFactory = ({ row }: TRowProps): React.JSX.Element => (
	<tr>
		{row.columns.map((column, index) => (
			<td
				key={index}
				style={{
					width: 'fit-content',
					border: '1px solid gray',
					borderRadius: 0,
					padding: 0,
					maxWidth: '5rem'
				}}
			>
				<Container width={'fit'}>{column}</Container>
			</td>
		))}
	</tr>
);

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const hours = [
		'12',
		...Array.from({ length: 11 }, (_, i) => (i + 1).toString()),
		'12',
		...Array.from({ length: 11 }, (_, i) => (i + 1).toString())
	];
	const sender = useAppSelector(selectSender(editorId));
	return (
		<Container data-testid={`daily-planner-component-${editorId}`}>
			<Table
				RowFactory={RowFactory}
				style={{ padding: 0, borderSpacing: 0 }}
				showCheckbox={false}
				headers={[
					{ id: 'organizer', label: '' },
					...hours.map((hour) => ({ id: hour, label: hour, colSpan: 2 }))
				]}
				rows={[
					{
						id: 'organizer',
						columns: [
							<Chip
								maxWidth={'fit-content'}
								key={'organizer'}
								label={sender.fullName.concat(
									'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
								)}
							/>,
							...Array.from({ length: 24 }, (_, index) => <div key={index} />)
						],
						highlight: false
					}
				]}
			/>
		</Container>
	);
};
