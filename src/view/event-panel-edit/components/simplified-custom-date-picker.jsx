/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { Container, Icon, Padding } from '@zextras/zapp-ui';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import Styler from './date-picker-style';

momentLocalizer();

export const SimplifiedCustomDatePicker = ({ start, allDay, disabled, onChange }) => {
	const startDate = useMemo(() => new Date(start), [start]);

	return (
		<>
			<Styler
				allDay={allDay}
				orientation="horizontal"
				height="fit"
				mainAlignment="flex-start"
				backgroundColor="gray5"
			>
				<Container crossAlignment="flex-start" style={{ maxWidth: '500px' }}>
					<DateTimePicker
						time={false}
						valueFormat={{ month: 'short', year: 'numeric' }}
						defaultValue={startDate}
						onChange={onChange}
						disabled={disabled}
						format="DD MMM YYYY"
						dateIcon={
							<Padding all="small">
								<Icon icon="CalendarOutline" />
							</Padding>
						}
					/>
				</Container>
			</Styler>
		</>
	);
};
