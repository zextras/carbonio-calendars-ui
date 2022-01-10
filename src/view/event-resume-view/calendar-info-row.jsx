/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Row, Text } from '@zextras/zapp-ui';
import React from 'react';

export const CalendarInfoRow = ({ event }) => (
	<Row width="fill" mainAlignment="flex-start">
		<Row takeAvailableSpace mainAlignment="flex-start">
			<Text overflow="break-word" color="gray1" size="small">
				{event?.resource?.calendar?.name}
			</Text>
		</Row>
	</Row>
);
