/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { useFolder } from '@zextras/carbonio-ui-commons';
import { isNil, omitBy } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { ImageAndIconPart } from './image-and-icon-part';
import { useNeverSentWarningLabel } from '../../hooks/use-never-sent-warning-label';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { EquipmentsRow } from '../event-summary-view/equipments-row';
import { FreeBusyStatusRowComponent } from '../event-summary-view/free-busy-status-row';
import { LocationRow } from '../event-summary-view/location-row';
import { MeetingRoomsRow } from '../event-summary-view/meeting-rooms-row';
import { NeverSentWarningRow } from '../event-summary-view/never-sent-warning-row';
import TagsRow from '../event-summary-view/tags-row';
import { TimeInfoRow } from '../event-summary-view/time-info-row';
import { VirtualRoomRow } from '../event-summary-view/virtual-room-row';
import { isExternalSyncFolder } from 'commons/utilities';

const PaddedRow = styled(Row)`
	padding: 0.25rem 0.25rem;
`;

const CustomIcon = styled(Icon)`
	width: 1.125rem;
	height: 1.125rem;
`;

type SubjectProps = {
	subject: string;
	calendarColor: string;
	isPrivate: boolean;
};

const SubjectRow = ({ subject, calendarColor, isPrivate }: SubjectProps): ReactElement => (
	<Container mainAlignment="flex-start" orientation="horizontal">
		{isPrivate && <Icon icon="Lock" color={calendarColor} style={{ padding: '0.25rem' }} />}
		<Text size="small" overflow="break-word" style={{ fontWeight: '600' }}>
			{subject}
		</Text>
		{/* TODO: tags */}
	</Container>
);

const InviteNeverSentRow = (): ReactElement => {
	const [t] = useTranslation();
	return (
		<PaddedRow takeAvailableSpace>
			<Icon icon="AlertCircleOutline" color="error" />
			<Padding horizontal="small">
				<Text color="error">
					{t('label.invitation_not_sent', "You haven't sent the invitation to the attendees yet")}
				</Text>
			</Padding>
		</PaddedRow>
	);
};

const CustomIconInfo = ({
	tooltipLabel,
	color,
	icon
}: {
	tooltipLabel: string;
	color: string;
	icon: string;
}): ReactElement => (
	<Tooltip label={tooltipLabel} placement="left">
		<div>
			<CustomIcon icon={icon} size="medium" color={color} />
		</div>
	</Tooltip>
);

type DetailsPartProps = {
	event: EventType;
	subject: string;
	inviteNeverSent: boolean;
	isPrivate: boolean;
	invite: Invite;
};

export const DetailsPart = ({
	event,
	subject,
	inviteNeverSent,
	isPrivate,
	invite
}: DetailsPartProps): ReactElement | null => {
	const calendar = useFolder(event.resource.calendar.id);
	const eventIsfromExternalCalendar = isExternalSyncFolder(calendar ?? {});
	const [t] = useTranslation();

	const color = useMemo(
		() => setCalendarColor({ rgb: calendar?.rgb, color: calendar?.color }),
		[calendar?.color, calendar?.rgb]
	);

	const timeData = useMemo<{
		allDay?: boolean;
		start?: number;
		end?: number;
		timezone: string;
	}>(
		() => ({
			...omitBy(
				{
					allDay: event.allDay,
					start: moment(event.start).valueOf(),
					end: moment(event.end).valueOf()
				},
				isNil
			),
			...{ timezone: invite?.tz ?? moment.tz.guess() }
		}),
		[event.allDay, event.end, event.start, invite?.tz]
	);

	const locationData = useMemo(
		() =>
			omitBy(
				{
					class: invite.class,
					location: invite.location,
					locationUrl: invite.locationUrl
				},
				isNil
			),
		[invite.class, invite.location, invite.locationUrl]
	);

	const title = useMemo(() => {
		if (event.resource.class === 'PRI') {
			return subject || t('label.private', 'Private');
		}
		return subject;
	}, [event.resource.class, subject, t]);

	const neverSentWarningLabel = useNeverSentWarningLabel(invite.attendees);

	return calendar ? (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ top: 'large', horizontal: 'large', bottom: 'small' }}
			background={'gray6'}
		>
			<Row orientation="row" width="fill" takeAvailableSpace>
				<Container width="fit">
					<ImageAndIconPart color={color} />
				</Container>
				<Padding right="large" />
				<Row orientation="row" width="fill" takeAvailableSpace mainAlignment="flex-start">
					<Container orientation="row" width="fill" mainAlignment="space-between">
						<SubjectRow subject={title} calendarColor={color.color} isPrivate={isPrivate} />
						{eventIsfromExternalCalendar && (
							<CustomIconInfo
								tooltipLabel={t(
									'label.external_calendar_event',
									'Event from an ICS calendar added from URL'
								)}
								color={'gray0'}
								icon={'Link2'}
							/>
						)}
						<Padding right={'small'} />
						{event.resource.isRecurrent && (
							<CustomIconInfo
								tooltipLabel={t('label.recurrent', 'Recurrent appointment')}
								color={'0'}
								icon={'Repeat'}
							/>
						)}
						<Padding right={'small'} />
						<CustomIconInfo tooltipLabel={calendar?.name} color={color.color} icon={'Calendar2'} />
					</Container>
					{timeData && <TimeInfoRow timeInfoData={timeData} />}
					{locationData && locationData?.class !== 'PRI' && (
						<LocationRow locationData={locationData} />
					)}
					<MeetingRoomsRow invite={invite} />
					<EquipmentsRow invite={invite} />
					{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} />}
					{invite && (
						<FreeBusyStatusRowComponent
							freeBusy={event.resource.freeBusy}
							organizerName={invite?.organizer?.a}
						/>
					)}
					{event?.resource?.tags?.length > 0 && <TagsRow event={event} hideIcon />}
				</Row>
			</Row>
			<Padding top={'medium'} />
			<NeverSentWarningRow neverSent={inviteNeverSent} label={neverSentWarningLabel} />
		</Container>
	) : null;
};
