/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Row, Shimmer } from '@zextras/carbonio-design-system';
import { isNil, omitBy, times } from 'lodash';

import { useInvite } from '../../hooks/use-invite';
import { useAppSelector } from '../../store/redux/hooks';
import { selectAppointment } from '../../store/selectors/appointments';
import { ReminderItem } from '../../types/appointment-reminder';
import { LocationRow } from '../event-summary-view/location-row';

export type AppointmentReminderItemDetailsProps = {
	reminderItem: ReminderItem;
};

export const AppointmentReminderItemDetails = ({
	reminderItem
}: AppointmentReminderItemDetailsProps): React.JSX.Element => {
	const appointment = useAppSelector(selectAppointment(reminderItem.id));
	const invite = useInvite(appointment?.inviteId);

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

	return (
		<Container>
			<Row
				width="fill"
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				gap="0.5rem"
			>
				{isInviteNotLoadedYet
					? shimmerRows
					: locationData && <LocationRow locationData={locationData} showIcon />}
			</Row>
		</Container>
	);

	/*
	<Container gap="0.5rem">
					{location && (
						<Row width="fill" padding={{ left: '2.5rem' }} mainAlignment="flex-start">
							<Padding right="small">
								<Icon icon="PinOutline" />
							</Padding>
							{locationUrl !== undefined ? (
								<Link target="_blank" href={locationUrl}>
									{locationUrl}
								</Link>
							) : (
								<Text>{location}</Text>
							)}
						</Row>
					)}

					{appointment.meetingRoom && (
						<Row width="fill" padding={{ left: '2.5rem' }} mainAlignment="flex-start">
							<Padding right="small">
								<Icon icon="PinOutline" />
							</Padding>
							<Text>{meetingRoom}</Text>
						</Row>
					)}

					{equipment && (
						<Row width="fill" padding={{ left: '2.5rem' }} mainAlignment="flex-start">
							<Padding right="small">
								<Icon icon="PinOutline" />
							</Padding>
							<Text>{equipment}</Text>
						</Row>
					)}

					{virtualRoom && (
						<Row width="fill" padding={{ left: '2.5rem' }} mainAlignment="flex-start">
							<Padding right="small">
								<Icon icon="PinOutline" />
							</Padding>
							<Text>{virtualRoom}</Text>
						</Row>
					)}

					{organizer && (
						<Row width="fill" padding={{ left: '2.5rem' }} mainAlignment="flex-start">
							<Padding right="small">
								<Avatar size="medium" label={organizer} />
							</Padding>
							<Text>{Organizer}</Text>
						</Row>
					)}

					{description && (
						<Row width="fill" padding={{ left: '2.5rem' }} mainAlignment="flex-start">
							<Padding right="small">
								<Icon icon="PinOutline" />
							</Padding>
							<Text>{description}</Text>
						</Row>
					)}
				</Container>
	 */
};
