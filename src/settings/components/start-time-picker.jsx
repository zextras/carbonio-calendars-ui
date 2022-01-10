/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import { Container, Icon, Padding, Text } from '@zextras/zapp-ui';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

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
	const [t] = useTranslation();
	getDate(start);
	const onStartChange = useCallback(
		(d) => {
			onChange({
				start: showEnd,
				hour: moment(d).hour() < 10 ? `0${moment(d).hour()}` : moment(d).hour(),
				minute: moment(d).minute() < 10 ? `0${moment(d).minute()}` : moment(d).minute(),
				day
			});
		},
		[onChange, day, showEnd]
	);
	const startTime = useMemo(() => getDate(start), [start]);

	return (
		<Container crossAlignment="flex-start" style={{ maxWidth: '600px' }}>
			<Padding bottom="extrasmall">
				<Text size="small">{t(`label.${label}`)}</Text>
			</Padding>
			<DateTimePicker
				date={false}
				value={startTime}
				disabled={disabled}
				onChange={onStartChange}
				timeIcon={
					<Padding all="small">
						<Icon icon="ClockOutline" />
					</Padding>
				}
			/>
		</Container>
	);
}
