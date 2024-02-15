/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, DateTimePicker, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

import DatePickerCustomComponent from '../../commons/date-picker-custom-component';

momentLocalizer();
const getHour = (hour) => {
	switch (hour) {
		case '00':
			return 0;
		case '01':
			return 1;
		case '02':
			return 2;
		case '03':
			return 3;
		case '04':
			return 4;
		case '05':
			return 5;
		case '06':
			return 6;
		case '07':
			return 7;
		case '08':
			return 8;
		case '09':
			return 9;
		default:
			return Number(hour);
	}
};
const getMin = (min) => {
	if (min < 10) return min.substring(1, 2);
	return min;
};
const getDate = (time) => {
	const hour = time.split('').slice(0, 2).join('');
	const min = time.split('').slice(2, 4).join('');
	return new Date(
		moment()
			.hour(getHour(hour))
			.minute(Number(getMin(min)))
	);
};
export default function StartDatePicker({ start, onChange, day, showEnd, disabled, label }) {
	const onStartChange = useCallback(
		(d) => {
			if (d) {
				onChange({
					start: showEnd,
					hour: moment(d).hour() < 10 ? `0${moment(d).hour()}` : moment(d).hour(),
					minute: moment(d).minute() < 10 ? `0${moment(d).minute()}` : moment(d).minute(),
					day
				});
			}
		},
		[onChange, day, showEnd]
	);
	const startTime = useMemo(() => getDate(start), [start]);

	return (
		<Container crossAlignment="flex-start" style={{ maxWidth: '37.5rem' }}>
			<Padding bottom="extrasmall">
				<Text size="small">{label}</Text>
			</Padding>
			<DateTimePicker
				width="100%"
				date={false}
				value={startTime}
				selected={startTime}
				disabled={disabled}
				showTimeSelectOnly
				timeIntervals={30}
				dateFormat="hh:mm aa"
				onChange={onStartChange}
				timeCaption={t('label.time', 'Time')}
				customInput={
					<DatePickerCustomComponent
						label={label}
						value={startTime}
						onChange={onStartChange}
						icon="ClockOutline"
					/>
				}
			/>
		</Container>
	);
}
