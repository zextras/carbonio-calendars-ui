/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';

type LocationProps = {
	location?: string;
	locationUrl?: string;
	class?: string;
	room?: {
		link: string;
		label: string;
	};
};

export const LocationRow = ({
	locationData,
	showIcon = false
}: {
	locationData: LocationProps;
	showIcon?: boolean;
}): ReactElement => {
	const location = useMemo(() => {
		const regex = /\bhttps?:\/\/\S+/g;
		return locationData?.location?.replace(regex, '');
	}, [locationData.location]);

	return (
		<>
			{(locationData?.location || locationData?.locationUrl || locationData?.room || location) && (
				<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						{showIcon && (
							<Padding right="small">
								<Icon icon="PinOutline" size="medium" />
							</Padding>
						)}
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text color="gray1" size="small">
								{locationData?.locationUrl && (
									<a href={locationData.locationUrl} target="_blank" rel="noreferrer">
										{locationData.locationUrl}
									</a>
								)}
								{location}
								{locationData?.room && (
									<a href={locationData.room.link} target="_blank" rel="noreferrer">
										{locationData.room.label}
									</a>
								)}
							</Text>
						</Row>
					</Row>
				</Row>
			)}
		</>
	);
};
