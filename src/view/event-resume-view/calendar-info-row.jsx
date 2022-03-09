/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React from 'react';

export const CalendarInfoRow = ({ event }) => (
	<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
		<Row takeAvailableSpace mainAlignment="flex-start">
			<Padding right="small">
				<Icon
					icon="Calendar2"
					size="medium"
					customColor={event?.resource?.calendar?.color?.color || 'primary'}
				/>
			</Padding>
			<Text overflow="break-word" size="medium" weight="bold">
				{event?.resource?.calendar?.name}
			</Text>
		</Row>
	</Row>
);
