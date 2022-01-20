/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const TimeInfoRow = ({ event }) => {
	const [t] = useTranslation();
	const date = React.useMemo(() => {
		if (event?.allDay) {
			const startDate = moment(event.start);
			const dayOfWeek = startDate.format('dddd');
			return `${dayOfWeek}, ${startDate.format('LL')} - ${t('label.all_day', 'All day')}`;
		}
		return `${moment(event.start).format('LLLL')} - ${moment(event.end).format('LT')}`;
	}, [event, t]);

	return (
		<Row width="fill" mainAlignment="flex-start">
			<Text overflow="break-word" weight="bold" size="small" color="gray1">
				{date}
				<br />
				GMT
				{`${moment(event.start).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`}
			</Text>
		</Row>
	);
};
