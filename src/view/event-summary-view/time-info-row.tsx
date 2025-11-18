/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Tooltip, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useGetDateRangeConvertedToTimezone } from '../../hooks/use-get-date-range-converted-to-timezone';

type TimeInfoProps = {
	allDay?: boolean;
	start?: number;
	end?: number;
	timezone: string;
};

export const TimeInfoRow = ({
	timeInfoData,
	showIcon = false
}: {
	timeInfoData: TimeInfoProps;
	showIcon?: boolean;
}): ReactElement => {
	const [t] = useTranslation();
	const creationTimeZoneTooltip = t(
		'creation_timezone_tooltip',
		'Date and time on creation timezone:'
	);

	const originalDate = useGetDateRangeConvertedToTimezone(
		timeInfoData.start ?? 0,
		timeInfoData.end ?? 0,
		{
			allDay: timeInfoData.allDay,
			timeZone: timeInfoData.timezone
		}
	);

	const localDate = useGetDateRangeConvertedToTimezone(
		timeInfoData.start ?? 0,
		timeInfoData.end ?? 0,
		{
			allDay: timeInfoData.allDay
		}
	);

	const convertedDateTooltip = useMemo(
		() => (
			<>
				{creationTimeZoneTooltip}
				<br />
				{originalDate}
			</>
		),
		[originalDate, creationTimeZoneTooltip]
	);

	return (
		<Row
			width="fill"
			mainAlignment="flex-start"
			padding={{ top: 'small' }}
			orientation="horizontal"
		>
			<Row width="fit-content" mainAlignment="flex-start">
				{showIcon && (
					<Padding right="small">
						<Icon icon="ClockOutline" size="medium" />
					</Padding>
				)}
			</Row>
			<Row mainAlignment="flex-start" takeAvailableSpace>
				<Row width="fit" mainAlignment="flex-start" crossAlignment="flex-start">
					<Row
						width="fit"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						takeAvailableSpace
					>
						<Tooltip label={localDate} overflowTooltip>
							<Text overflow="break-word" weight="bold" size="small" color="gray1">
								{localDate}
							</Text>
						</Tooltip>
					</Row>
					<Padding right="small" />
					{localDate !== originalDate && (
						<Row mainAlignment="flex-start" crossAlignment="flex-start" width="fit">
							<Tooltip label={convertedDateTooltip}>
								<Row>
									<Icon icon="GlobeOutline" color="gray1" />
								</Row>
							</Tooltip>
						</Row>
					)}
				</Row>
			</Row>
		</Row>
	);
};
