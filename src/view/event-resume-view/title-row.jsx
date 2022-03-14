/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Divider, Icon, Row, Text } from '@zextras/carbonio-design-system';
import React from 'react';

export const TitleRow = ({ event }) => (
	<>
		<Row width="fill" padding={{ bottom: 'small' }}>
			{event.resource.class === 'PRI' && (
				<Row padding={{ all: 'small' }}>
					<Icon
						customColor={event.resource.calendar.color.color}
						icon="LockOutline"
						style={{ minWidth: '16px' }}
					/>
				</Row>
			)}
			<Row takeAvailableSpace mainAlignment="flex-start">
				<Text size="large" weight="bold">
					{event.resource.class === 'PRI' ? 'Private' : event.title}
				</Text>
			</Row>
			{event.resource.class !== 'PRI' && (
				<>
					<Row padding={{ right: 'small' }}>
						{event?.resource?.tagName && (
							<Icon customColor={event.resource.calendar.color.color} icon="Tag" />
						)}
					</Row>
					<Row>{event?.resource?.flags?.includes('a') && <Icon icon="AttachOutline" />}</Row>
					{!event?.resource?.calendar?.owner && !event?.resource?.iAmOrganizer && (
						<Row>
							{event.resource?.participationStatus === 'NE' && (
								<Icon icon="CalendarWarning" color="primary" />
							)}
						</Row>
					)}
				</>
			)}
		</Row>
		<Divider />
	</>
);
