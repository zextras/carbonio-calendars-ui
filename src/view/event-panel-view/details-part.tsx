/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';
import React, { ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../hooks/redux';
import { selectCalendar } from '../../store/selectors/calendars';
import { EventType } from '../../types/event';
import { Calendar } from '../../types/store/calendars';
import { Invite } from '../../types/store/invite';
import { LocationRow } from '../event-summary-view/location-row';
import TagsRow from '../event-summary-view/tags-row';
import { TimeInfoRow } from '../event-summary-view/time-info-row';
import { VirtualRoomRow } from '../event-summary-view/virtual-room-row';
import { ImageAndIconPart } from './image-and-icon-part';

const PaddedRow = styled(Row)`
	padding: 0.25rem 0.25rem;
`;

const CalendarIcon = styled(Icon)`
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
		{isPrivate && <Icon icon="Lock" customColor={calendarColor} style={{ padding: '0.25rem' }} />}
		<Text size="small" overflow="break-word" style={{ fontWeight: '600' }}>
			{subject}
		</Text>
		{/* TODO: tags */}
	</Container>
);

const InviteNeverSentRow = (): ReactElement => (
	<PaddedRow takeAvailableSpace>
		<Icon icon="AlertCircleOutline" color="error" />
		<Padding horizontal="small">
			<Text color="error">
				{t('label.invitation_not_sent', "You haven't sent the invitation to the attendees yet")}
			</Text>
		</Padding>
	</PaddedRow>
);

const CalendarInfo = ({ calendar }: { calendar: Calendar }): ReactElement => (
	<Tooltip label={calendar.name} placement="left">
		<div>
			<CalendarIcon icon="Calendar2" size="medium" customColor={calendar.color.color} />
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
	const calendar = useAppSelector(selectCalendar(event.resource.calendar.id));

	const timeData = useMemo(
		() =>
			omitBy(
				{
					allDay: event.allDay,
					start: event.start,
					end: event.end
				},
				isNil
			),
		[event.allDay, event.end, event.start]
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
	return calendar ? (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ top: 'large', horizontal: 'large', bottom: 'small' }}
			background="gray6"
		>
			<Row orientation="row" width="fill" takeAvailableSpace>
				<Container width="fit">
					<ImageAndIconPart color={calendar.color.color || 'primary'} />
				</Container>
				<Padding right="large" />
				<Row orientation="row" width="fill" takeAvailableSpace mainAlignment="flex-start">
					<Container orientation="row" width="fill" mainAlignment="space-between">
						<SubjectRow
							subject={subject}
							calendarColor={calendar.color.color}
							isPrivate={isPrivate}
						/>
						{calendar && <CalendarInfo calendar={calendar} />}
					</Container>
					{timeData && <TimeInfoRow timeInfoData={timeData} />}
					{locationData && locationData?.class !== 'PRI' && (
						<LocationRow locationData={locationData} />
					)}
					{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} />}
					{event?.resource?.tags?.length > 0 && <TagsRow event={event} hideIcon />}
				</Row>
			</Row>
			<Padding top={'medium'} />
			{inviteNeverSent && <InviteNeverSentRow />}
		</Container>
	) : null;
};
