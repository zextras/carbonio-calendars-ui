/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Icon, Padding, Row, Text, Tooltip } from '@zextras/zapp-ui';
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ImageAndIconPart from './image-and-icon-part';
import { TimeInfoRow } from '../event-resume-view/time-info-row';
import { LocationRow } from '../event-resume-view/location-row';
import { CalendarInfoRow } from '../event-resume-view/calendar-info-row';

const PaddedRow = styled(Row)`
	padding: 4px 4px;
`;

function SubjectRow({ subject, calendarColor, isPrivate }) {
	return (
		<Container mainAlignment="flex-start" orientation="horizontal">
			{isPrivate && <Icon icon="Lock" customColor={calendarColor} style={{ padding: '4px' }} />}
			<Text weight="bold" size="small" overflow="break-word">
				{subject}
			</Text>
			{/* TODO: tags */}
		</Container>
	);
}

function InviteNeverSentRow({ inviteNeverSent = false }) {
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
}

export default function DetailsPart({ subject, calendarColor, inviteNeverSent, isPrivate, event }) {
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
				<Row orientation="row" width="fill" takeAvailableSpace>
					<Container orientation="row" width="fill" mainAlignment="space-between">
						<SubjectRow
							subject={subject}
							calendarColor={calendarColor}
							isPrivate={isPrivate}
							width="fit"
						/>
						<Tooltip label={event.resource.calendar.name} placement="left">
							<div>
								<Icon icon="Calendar2" size="small" customColor={calendarColor} />
							</div>
						</Tooltip>
					</Container>
					<CalendarInfoRow event={event} />
					{event && <TimeInfoRow event={event} width="fill" />}
					{event && <LocationRow event={event} width="fill" />}
				</Row>
			</Row>
			<Padding top={'medium'} />
			<InviteNeverSentRow inviteNeverSent={inviteNeverSent} width="fill" />
		</Container>
	);
}
