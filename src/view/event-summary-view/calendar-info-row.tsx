/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { selectCalendar } from '../../store/selectors/calendars';

export const CalendarInfoRow = (): ReactElement => {
	const { calendarId } = useParams<{ calendarId: string }>();
	const calendar = useAppSelector(selectCalendar(calendarId));

	return (
		<>
			{calendar && (
				<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Padding right="small">
							<Icon
								icon="Calendar2"
								size="medium"
								customColor={calendar?.color?.color ?? 'primary'}
							/>
						</Padding>
						<Text overflow="break-word" size="medium" weight="bold">
							{calendar?.name}
						</Text>
					</Row>
				</Row>
			)}
		</>
	);
};
