/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Tooltip, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useGetEventTimezoneString } from '../../hooks/use-get-event-timezone';

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
	const {
		originalTimeString,
		originalTimezoneString,
		timezoneStringConvertedToLocal,
		timeStringConvertedToLocal
	} = useGetEventTimezoneString(timeInfoData.start ?? 0, timeInfoData.end ?? 0, {
		allDay: timeInfoData.allDay,
		timeZone: timeInfoData.timezone
	});
	const [t] = useTranslation();

	const convertedDateTooltip = useMemo(
		() => (
			<>
				{t('creation_timezone_tooltip', 'Date and time on creation timezone:')}
				<br />
				{timeStringConvertedToLocal ?? originalTimeString}
				<br />
				{timezoneStringConvertedToLocal ?? originalTimezoneString}
			</>
		),
		[
			originalTimeString,
			originalTimezoneString,
			t,
			timeStringConvertedToLocal,
			timezoneStringConvertedToLocal
		]
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
						<Tooltip label={originalTimeString} overflowTooltip>
							<Text overflow="ellipsis" weight="bold" size="small" color="gray1">
								{originalTimeString}
							</Text>
						</Tooltip>
					</Row>
					<Padding right="small" />
					{timeStringConvertedToLocal && (
						<Row mainAlignment="flex-start" crossAlignment="flex-start" width="fit">
							<Tooltip label={convertedDateTooltip}>
								<Row>
									<Icon icon="GlobeOutline" color="gray1" />
								</Row>
							</Tooltip>
						</Row>
					)}
				</Row>
				<Row width="fill" mainAlignment="flex-start">
					<Text overflow="break-word" weight="bold" size="small" color="gray1">
						{originalTimezoneString}
					</Text>
				</Row>
			</Row>
		</Row>
	);
};
