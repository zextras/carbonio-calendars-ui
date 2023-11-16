/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { filter, map } from 'lodash';

import { CALENDAR_RESOURCES } from '../../constants';
import { Invite } from '../../types/store/invite';

export const MeetingRoomsRow = ({
	invite,
	showIcon
}: {
	invite: Invite;
	showIcon?: boolean;
}): ReactElement | null => {
	const meetingRooms = useMemo(
		() => filter(invite.attendees, ['cutype', CALENDAR_RESOURCES.ROOM]),
		[invite.attendees]
	);
	const rooms = useMemo(
		() => map(meetingRooms, (meetingRoom) => meetingRoom.d).join(', '),
		[meetingRooms]
	);
	return meetingRooms.length ? (
		<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
			<Row takeAvailableSpace mainAlignment="flex-start">
				{showIcon && (
					<Padding right="small">
						<Icon icon="BuildingOutline" size="medium" />
					</Padding>
				)}
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text color="gray1" size="small">
						{rooms}
					</Text>
				</Row>
			</Row>
		</Row>
	) : null;
};
