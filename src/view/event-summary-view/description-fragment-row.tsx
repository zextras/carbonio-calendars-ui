/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Icon, Row, Text } from '@zextras/carbonio-design-system';

import { EventType } from '../../types/event';

export const DescriptionFragmentRow = ({ event }: { event: EventType }): ReactElement => (
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
						padding={{ vertical: 'small' }}
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
	</>
);
