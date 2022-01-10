/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Divider, Icon, Row, Text } from '@zextras/zapp-ui';
import React from 'react';

export const DescriptionFragmentRow = ({ event }) => (
	<>
		{event.resource.class === 'PRI' &&
		!event?.resource?.iAmOrganizer &&
		!event?.resource?.calendar?.owner ? null : (
			<>
				{event.resource.fragment && event.resource.fragment.length > 0 && (
					<Row
						width="fill"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ horizontal: 'small', bottom: 'small' }}
					>
						<Row padding={{ right: 'small' }}>
							<Icon icon="MessageSquareOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text overflow="break-word">{event.resource.fragment}</Text>
						</Row>
					</Row>
				)}
			</>
		)}
		<Divider />
	</>
);
