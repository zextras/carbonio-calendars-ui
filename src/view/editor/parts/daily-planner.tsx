/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { Chip, Container } from '@zextras/carbonio-design-system';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectSender } from '../../../store/selectors/editor';

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
			<Table>
				<TableBody>
					<TableRow>
						<TableCell style={{ width: '500px' }} />
						{hours.map((hour, index) => (
							<TableCell key={index} colSpan={2} style={{ textAlign: 'center' }}>
								{hour}
							</TableCell>
						))}
					</TableRow>
					<TableRow>
						<TableCell style={{ width: '500px', border: '1px solid gray' }}>
							<Chip label={sender.fullName} />
						</TableCell>
						{Array.from({ length: 24 * 2 }, (_, index) => (
							<TableCell key={index} style={{ width: '500px', border: '1px solid gray' }} />
						))}
					</TableRow>
				</TableBody>
			</Table>
		</Container>
	);
};
