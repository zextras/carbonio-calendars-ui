/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import {
	Icon,
	Padding,
	Row,
	Tooltip,
	Text,
	TextWithTooltip
} from '@zextras/carbonio-design-system';
import moment, { Moment } from 'moment';

import { useGetEventTimezoneString } from '../../hooks/use-get-event-timezone';

type TimeInfoProps = {
	allDay?: boolean;
	start?: Date | Moment;
	end?: Date | Moment;
	timezone: string;
};

export const TimeInfoRow = ({
	timeInfoData,
	showIcon = false
}: {
	timeInfoData: TimeInfoProps;
	showIcon?: boolean;
}): ReactElement => {
	const { localTimeString, localTimezoneString, localTimezoneTooltip, showTimezoneTooltip } =
		useGetEventTimezoneString(
			timeInfoData.start ?? moment(),
			timeInfoData.end ?? moment(),
			timeInfoData.allDay,
			timeInfoData.timezone
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
						<TextWithTooltip overflow="ellipsis" weight="bold" size="small" color="gray1">
							{localTimeString}
						</TextWithTooltip>
					</Row>
					<Padding right="small" />
					{showTimezoneTooltip && (
						<Row mainAlignment="flex-start" crossAlignment="flex-start" width="fit">
							<Tooltip label={localTimezoneTooltip}>
								<Row>
									<Icon icon="GlobeOutline" color="gray1" />
								</Row>
							</Tooltip>
						</Row>
					)}
				</Row>
				<Row width="fill" mainAlignment="flex-start">
					<Text overflow="break-word" weight="bold" size="small" color="gray1">
						{localTimezoneString}
					</Text>
				</Row>
			</Row>
		</Row>
	);
};
