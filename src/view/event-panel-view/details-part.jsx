/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isNil, omitBy } from 'lodash';
import ImageAndIconPart from './image-and-icon-part';
import { TimeInfoRow } from '../event-summary-view/time-info-row';
import { LocationRow } from '../event-summary-view/location-row';
import { VirtualRoomRow } from '../event-summary-view/virtual-room-row';
import TagsRow from '../event-summary-view/tags-row';
import { selectCalendar } from '../../store/selectors/calendars';

const PaddedRow = styled(Row)`
	padding: 4px 4px;
`;

const CalendarIcon = styled(Icon)`
	width: 18px;
	height: 18px;
`;

const SubjectRow = ({ subject, calendarColor, isPrivate }) => (
	<Container mainAlignment="flex-start" orientation="horizontal">
		{isPrivate && <Icon icon="Lock" customColor={calendarColor} style={{ padding: '4px' }} />}
		<Text size="small" overflow="break-word" style={{ fontWeight: '600' }}>
			{subject}
		</Text>
		{/* TODO: tags */}
	</Container>
);

const InviteNeverSentRow = ({ inviteNeverSent = false }) => {
	const [t] = useTranslation();
	if (inviteNeverSent) {
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
	}
	return null;
};

const CalendarInfo = ({ calendar }) => (
	<Tooltip label={calendar.name} placement="left">
		<div>
			<CalendarIcon icon="Calendar2" size="medium" customColor={calendar.color.color} />
		</div>
	</Tooltip>
);

export const DetailsPart = ({
	subject,
	calendarColor,
	inviteNeverSent,
	isPrivate,
	event,
	invite
}) => {
	const { calendarId } = useParams();
	const calendar = useSelector((s) => selectCalendar(s, calendarId));

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
					class: event.resource.class,
					location: event.resource.location,
					locationUrl: event.resource.locationUrl
				},
				isNil
			),
		[event?.resource?.class, event?.resource?.location, event?.resource?.locationUrl]
	);
	return (
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
					<ImageAndIconPart color={calendarColor || 'primary'} />
				</Container>
				<Padding right="large" />
				<Row orientation="row" width="fill" takeAvailableSpace mainAlignment="flex-start">
					<Container orientation="row" width="fill" mainAlignment="space-between">
						<SubjectRow
							subject={subject}
							calendarColor={calendarColor}
							isPrivate={isPrivate}
							width="fit"
						/>
						{calendar && <CalendarInfo calendar={calendar} />}
					</Container>
					{timeData && <TimeInfoRow timeInfoData={timeData} />}
					{locationData && locationData?.class !== 'PRI' && (
						<LocationRow locationData={locationData} width="fill" />
					)}
					{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} />}
					{event?.resource?.tags?.length > 0 && <TagsRow event={event} hideIcon />}
				</Row>
			</Row>
			<Padding top={'medium'} />
			<InviteNeverSentRow inviteNeverSent={inviteNeverSent} width="fill" />
		</Container>
	);
};
