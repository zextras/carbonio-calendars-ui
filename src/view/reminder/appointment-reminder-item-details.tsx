/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Row, Shimmer } from '@zextras/carbonio-design-system';
import { isNil, omitBy, startsWith, times } from 'lodash';

import { LinkFolder } from '../../carbonio-ui-commons/types';
import { ROOM_DIVIDER } from '../../constants';
import { useInvite } from '../../hooks/use-invite';
import { useAppSelector } from '../../store/redux/hooks';
import { selectAppointment } from '../../store/selectors/appointments';
import { ReminderItem } from '../../types/appointment-reminder';
import { OrganizerPart } from '../event-panel-view/organizer-part';
import { DescriptionFragmentRow } from '../event-summary-view/description-fragment-row';
import { EquipmentsRow } from '../event-summary-view/equipments-row';
import { LocationRow } from '../event-summary-view/location-row';
import { MeetingRoomsRow } from '../event-summary-view/meeting-rooms-row';
import { VirtualRoomRow } from '../event-summary-view/virtual-room-row';

const DETAILS_FONT_SIZE = 'medium';

export type AppointmentReminderItemDetailsProps = {
	reminderItem: ReminderItem;
};

export const AppointmentReminderItemDetails = ({
	reminderItem
}: AppointmentReminderItemDetailsProps): React.JSX.Element => {
	const appointment = useAppSelector(selectAppointment(reminderItem.id));
	const invite = useInvite(appointment?.inviteId);

	const calendarOwner = useMemo(
		() => (reminderItem.calendar as LinkFolder).owner,
		[reminderItem.calendar]
	);

	const locationData = useMemo(
		() =>
			omitBy(
				{
					class: invite?.class,
					location: invite?.location,
					locationUrl: invite?.locationUrl
				},
				isNil
			),
		[invite?.class, invite?.location, invite?.locationUrl]
	);

	const isInviteNotLoadedYet = useMemo(() => !invite, [invite]);

	const shimmerRows = useMemo(
		() =>
			times(
				7,
				(index): React.JSX.Element => (
					<Row
						key={index}
						data-testid={`appointment-reminder-item-details-shimmer-row-${index}`}
						width="fill"
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						gap="0.5rem"
					>
						<Row>
							<Shimmer.Icon />
						</Row>
						<Row takeAvailableSpace>
							<Shimmer.Text />
						</Row>
					</Row>
				)
			),
		[]
	);

	const detailRows = useMemo(
		() => (
			<>
				{locationData && (
					<LocationRow locationData={locationData} showIcon fontSize={DETAILS_FONT_SIZE} />
				)}
				{invite && <MeetingRoomsRow invite={invite} showIcon fontSize={DETAILS_FONT_SIZE} />}
				{invite && <EquipmentsRow invite={invite} showIcon fontSize={DETAILS_FONT_SIZE} />}
				{invite?.xprop && (
					<VirtualRoomRow xprop={invite?.xprop} showIcon fontSize={DETAILS_FONT_SIZE} />
				)}
				{invite && (
					<OrganizerPart
						invite={invite}
						organizer={invite.organizer}
						calendarOwner={calendarOwner}
						isSummary
						fontSize={DETAILS_FONT_SIZE}
					/>
				)}
				{invite && !startsWith(invite.fragment ?? '', ROOM_DIVIDER) && (
					<DescriptionFragmentRow
						invite={invite}
						calendarOwner={calendarOwner}
						fontSize={DETAILS_FONT_SIZE}
					/>
				)}
			</>
		),
		[calendarOwner, invite, locationData]
	);

	return (
		<Container>
			<Row
				width="fill"
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				gap="0.25rem"
			>
				{isInviteNotLoadedYet ? shimmerRows : detailRows}
			</Row>
		</Container>
	);
};
