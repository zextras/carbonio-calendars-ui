/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment, { Moment } from 'moment';
import React, { ReactElement, useMemo } from 'react';
import { Invite } from '../../types/store/invite';

type TimeInfoProps = {
	allDay?: boolean;
	start?: Date | Moment;
	end?: Date | Moment;
};

export const TimeInfoRow = ({
	timeInfoData,
	invite,
	showIcon = false
}: {
	timeInfoData: TimeInfoProps;
	invite: Invite;
	showIcon?: boolean;
}): ReactElement | null => {
	const date = useMemo(() => {
		if (invite.tz) {
			if (timeInfoData.allDay) {
				const startDate = moment(timeInfoData.start).tz(invite.tz);
				const dayOfWeek = startDate.format('dddd');
				return `${dayOfWeek}, ${startDate.format('LL')} - ${t('label.all_day', 'All day')}`;
			}
			return `${moment(timeInfoData.start).tz(invite.tz).format('LLLL')} - ${moment(
				timeInfoData.end
			)
				.tz(invite.tz)
				.format('LT')}`;
		}
		return undefined;
	}, [invite.tz, timeInfoData.allDay, timeInfoData.end, timeInfoData.start]);

	const gmtDate = useMemo(
		() =>
			invite.tz
				? `${moment(timeInfoData.start).tz(invite.tz).format('Z')} ${invite.tz}`
				: undefined,
		[invite.tz, timeInfoData.start]
	);

	return date ? (
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
	) : null;
};
