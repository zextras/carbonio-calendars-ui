/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import moment, { Moment } from 'moment';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type TimeInfoProps = {
	allDay?: boolean;
	start?: Date | Moment;
	end?: Date | Moment;
};

export const TimeInfoRow = ({
	timeInfoData,
	showIcon = false
}: {
	timeInfoData: TimeInfoProps;
	showIcon?: boolean;
}): ReactElement => {
	const [t] = useTranslation();
	const date = useMemo(() => {
		if (timeInfoData.allDay) {
			const startDate = moment(timeInfoData.start);
			const dayOfWeek = startDate.format('dddd');
			return `${dayOfWeek}, ${startDate.format('LL')} - ${t('label.all_day', 'All day')}`;
		}
		return `${moment(timeInfoData.start).format('LLLL')} - ${moment(timeInfoData.end).format(
			'LT'
		)}`;
	}, [t, timeInfoData.allDay, timeInfoData.end, timeInfoData.start]);

	const gmtDate = useMemo(
		() => `${moment(timeInfoData.start).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`,
		[timeInfoData.start]
	);

	return (
		<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
			<Row takeAvailableSpace mainAlignment="flex-start">
				{showIcon && (
					<Padding right="small">
						<Icon icon="ClockOutline" size="medium" />
					</Padding>
				)}
				<Text overflow="break-word" weight="bold" size="small" color="gray1">
					{date}
					<br />
					GMT
					{gmtDate}
				</Text>
			</Row>
		</Row>
	);
};
