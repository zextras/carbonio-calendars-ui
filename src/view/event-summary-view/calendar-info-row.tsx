/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { useParams } from 'react-router-dom';

import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { setCalendarColor } from '../../normalizations/normalizations-utils';

export const CalendarInfoRow = (): ReactElement => {
	const { calendarId } = useParams<{ calendarId: string }>();
	const calendar = useFolder(calendarId);
	const color = setCalendarColor({ color: calendar?.color, rgb: calendar?.rgb });
	return (
		<>
			{calendar && (
				<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Padding right="small">
							<Icon icon="Calendar2" size="medium" customColor={color.color} />
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
