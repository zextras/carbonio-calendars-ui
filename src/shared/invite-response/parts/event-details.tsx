/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement } from 'react';

import styled from '@emotion/styled';
import { Text, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { IconWithLabel } from './icon-with-label';
import { useResources } from '../hooks/use-resources';
import { Invite } from 'types/store/invite';

export const LinkText = styled(Text)`
	cursor: pointer;
	text-decoration: underline;
	&:hover {
		text-decoration: none;
	}
`;

type EventDetailsProps = {
	invite: Invite;
};

export const EventDetails: FC<EventDetailsProps> = ({ invite }): ReactElement | null => {
	const [t] = useTranslation();

	const { virtualRoom, meetingRooms, equipment, meetingRoomsString, equipmentString } =
		useResources(invite.attendees, invite.xprop ?? []);

	const hasMeetingRooms = meetingRooms.length > 0;
	const hasEquipment = equipment.length > 0;

	return (
		<>
			{invite.location && (
				<IconWithLabel icon="PinOutline" tooltipLabel={t('tooltip.location', 'Location')}>
					<Tooltip placement="right" label={invite.location}>
						<Text size="medium" overflow="break-word">
							{invite.location}
						</Text>
					</Tooltip>
				</IconWithLabel>
			)}

			{virtualRoom?.roomName && virtualRoom?.roomLink && (
				<IconWithLabel icon="VideoOutline" tooltipLabel={t('tooltip.virtual_room', 'Virtual room')}>
					<Tooltip placement="right" label={virtualRoom.roomLink}>
						<LinkText color="gray1" size="medium" overflow="break-word">
							<a href={virtualRoom.roomLink} target="_blank" rel="noreferrer">
								{virtualRoom.roomName}
							</a>
						</LinkText>
					</Tooltip>
				</IconWithLabel>
			)}

			{hasMeetingRooms && (
				<IconWithLabel
					icon="BuildingOutline"
					tooltipLabel={t('tooltip.meetingRooms', 'MeetingRooms')}
				>
					<Tooltip placement="right" label={t('tooltip.meetingRooms', 'MeetingRooms')}>
						<Text size="medium" overflow="break-word">
							{meetingRoomsString}
						</Text>
					</Tooltip>
				</IconWithLabel>
			)}

			{hasEquipment && (
				<IconWithLabel icon="BriefcaseOutline" tooltipLabel={t('tooltip.equipment', 'Equipment')}>
					<Tooltip placement="right" label={t('tooltip.equipment', 'Equipment')}>
						<Text size="medium" overflow="break-word">
							{equipmentString}
						</Text>
					</Tooltip>
				</IconWithLabel>
			)}
		</>
	);
};
