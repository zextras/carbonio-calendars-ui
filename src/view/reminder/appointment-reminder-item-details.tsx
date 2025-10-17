/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Icon, Padding, Row, Shimmer, Theme } from '@zextras/carbonio-design-system';
import { LinkFolder } from '@zextras/carbonio-ui-commons';
import { isNil, omitBy, times } from 'lodash';

import { BodyMessageRenderer } from '../../commons/body-message-renderer';
import { useInvite } from '../../hooks/use-invite';
import { useAppSelector } from '../../store/redux/hooks';
import { selectAppointment } from '../../store/selectors/appointments';
import { ReminderItem } from '../../types/appointment-reminder';
import { OrganizerPart } from '../event-panel-view/organizer-part';
import { EquipmentsRow } from '../event-summary-view/equipments-row';
import { LocationRow } from '../event-summary-view/location-row';
import { MeetingRoomsRow } from '../event-summary-view/meeting-rooms-row';
import { VirtualRoomRow } from '../event-summary-view/virtual-room-row';

export type AppointmentReminderItemDetailsProps = {
	reminderItem: ReminderItem;
	fontSize?: keyof typeof Theme.sizes.font;
};

export const AppointmentReminderItemDetails = ({
	reminderItem,
	fontSize = 'medium'
}: AppointmentReminderItemDetailsProps): React.JSX.Element => {
	const appointment = useAppSelector(selectAppointment(reminderItem.id));
	const invite = useInvite(appointment?.inviteId);

	const calendarOwner = useMemo(
		() => (reminderItem.calendar as LinkFolder)?.owner,
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
				{locationData && <LocationRow locationData={locationData} showIcon fontSize={fontSize} />}
				{invite && <MeetingRoomsRow invite={invite} showIcon fontSize={fontSize} />}
				{invite && <EquipmentsRow invite={invite} showIcon fontSize={fontSize} />}
				{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} showIcon fontSize={fontSize} />}
				{invite?.organizer && (
					<OrganizerPart
						invite={invite}
						organizer={invite.organizer}
						calendarOwner={calendarOwner}
						isSummary
						fontSize={fontSize}
					/>
				)}
				{invite && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
						<Row width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
							<Padding right="small">
								<Icon icon="MessageSquareOutline" size="medium" />
							</Padding>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<BodyMessageRenderer
									fontSize={fontSize}
									htmlDescription={invite.htmlDescription}
									textDescription={invite.textDescription}
								/>
							</Row>
						</Row>
					</Row>
				)}
			</>
		),
		[calendarOwner, fontSize, invite, locationData]
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
