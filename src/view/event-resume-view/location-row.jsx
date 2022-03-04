/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Row, Text } from '@zextras/carbonio-design-system';
import React, { useMemo } from 'react';

export const LocationRow = ({ event }) => {
	const location = useMemo(() => {
		const regex = /\bhttps?:\/\/\S+/g;
		return event.resource.location?.replace(regex, '');
	}, [event.resource.location]);

	return (
		event?.resource?.class !== 'PRI' && (
			<>
				{event.resource.location && event.resource.location.length > 0 && (
					<Row
						style={{ overflow: 'hidden' }}
						mainAlignment="flex-start"
						padding={{ bottom: 'small' }}
						width="fill"
					>
						<Text color="gray1" size="small">
							{event.resource.locationUrl ? (
								<>
									<a href={event.resource.locationUrl} target="_blank" rel="noreferrer">
										{event.resource.locationUrl}
									</a>
									{location}
									{event.resource.room && (
										<a href={event.resource.room.link} target="_blank" rel="noreferrer">
											{event.resource.room.label}
										</a>
									)}
								</>
							) : (
								<>
									{location}
									{event.resource.room && (
										<a href={event.resource.room.link} target="_blank" rel="noreferrer">
											{event.resource.room.label}
										</a>
									)}
								</>
							)}
						</Text>
					</Row>
				)}
			</>
		)
	);
};
