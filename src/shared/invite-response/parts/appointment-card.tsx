/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, Icon, Row, Tooltip, Padding, Text } from '@zextras/carbonio-design-system';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';

import { TagIconComponent } from '../../../commons/tag-icon-component';
import { CALENDAR_ROUTE } from '../../../constants';
import { PARTICIPATION_STATUS } from '../../../constants/api';
import { EVENT_ACTIONS } from '../../../constants/event-actions';
import { useNeverSentWarningLabel } from '../../../hooks/use-never-sent-warning-label';
import { EventType } from '../../../types/event';

const useEventTimeString = (start: Moment | Date, end: Moment | Date, allDay: boolean): string => {
	const [t] = useTranslation();
	const isSingleAllDay = moment(start).day() === moment(end).day() && allDay;
	const isMultiAllDay = moment(start).day() !== moment(end).day() && allDay;
	const isMulti = moment(start).day() !== moment(end).day() && !allDay;

	if (isSingleAllDay) {
		return t('label.all_day', 'All day');
	}
	if (isMulti) {
		return `${moment(start).format('MMMM Do YYYY hh:mm A')} - ${moment(end).format(
			'MMMM Do YYYY hh:mm A'
		)}`;
	}
	if (isMultiAllDay) {
		return `${moment(start).format('MMMM Do YYYY')} - ${moment(end).format('MMMM Do YYYY')} - ${t(
			'label.all_day',
			'All day'
		)}`;
	}
	return `${moment(start).format('hh:mm A')} - ${moment(end).format('hh:mm A')}`;
};

export const AppointmentCard = ({ event }: { event: EventType }): JSX.Element => {
	const [t] = useTranslation();
	const { pushHistory } = useHistoryNavigation();

	const onClick = useCallback(() => {
		pushHistory(
			`/${CALENDAR_ROUTE}/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
		);
	}, [event.resource.calendar.id, event.resource.id, event.resource.ridZ, pushHistory]);

	const eventTimeString = useEventTimeString(event.start, event.end, event.allDay);
	const neverSentWarningLabel = useNeverSentWarningLabel();
	return (
		<Tooltip
			placement={'top'}
			label={t('label.show_event', 'Double click to see more details on Calendars')}
		>
			<Container
				data-testid={`cardContainer-${event.id}`}
				mainAlignment="flex-start"
				orientation={'row'}
				onDoubleClick={onClick}
				background={event.resource.calendar.color.background}
				borderColor={event.resource.calendar.color.color}
				padding={{ all: 'extrasmall' }}
				height={'fit'}
				style={{ overflowY: 'auto', cursor: 'pointer' }}
			>
				<Tooltip placement="top" label={event.resource.calendar.name}>
					<Row padding={{ all: 'extrasmall' }}>
						<Icon icon="Calendar2" size="large" color={event.resource.calendar.color.color} />
					</Row>
				</Tooltip>
				<Container style={{ overflowX: 'auto' }}>
					<Row
						width="fill"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						wrap={'nowrap'}
						style={{ overflowX: 'hidden' }}
					>
						<Tooltip label={eventTimeString} overflowTooltip>
							<Text size="medium" color={event.resource.calendar.color.color} overflow={'ellipsis'}>
								{eventTimeString}
							</Text>
						</Tooltip>
						<Row mainAlignment="flex-end" style={{ overflowX: 'visible' }} wrap={'nowrap'}>
							{event.resource.class === 'PRI' && (
								<Tooltip label={t('label.private', 'Private')} placement="top">
									<Padding left="extrasmall">
										<Icon color={event.resource.calendar.color.color} icon="Lock" size="medium" />
									</Padding>
								</Tooltip>
							)}
							{event?.resource?.inviteNeverSent && (
								<Tooltip label={neverSentWarningLabel} placement="top">
									<Padding left="extrasmall">
										<Icon
											icon="AlertCircleOutline"
											size="medium"
											color="#D74942" // TODO: understand if a custom color is still needed, if so use a constant instead
										/>
									</Padding>
								</Tooltip>
							)}
							{!event?.resource?.calendar?.owner &&
								!event?.resource?.iAmOrganizer &&
								event.resource?.participationStatus === PARTICIPATION_STATUS.NEED_ACTION && (
									<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
										<Padding left="extrasmall">
											<Icon icon="CalendarWarning" color="primary" size="medium" />
										</Padding>
									</Tooltip>
								)}
							<TagIconComponent event={event} />
						</Row>
					</Row>
					<Row
						width="fill"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						wrap={'nowrap'}
						style={{ overflowX: 'hidden' }}
					>
						<Tooltip label={event.title} overflowTooltip>
							<Text size="medium" weight="bold" color={event.resource.calendar.color.color}>
								{event.title}
							</Text>
						</Tooltip>
					</Row>
				</Container>
			</Container>
		</Tooltip>
	);
};
