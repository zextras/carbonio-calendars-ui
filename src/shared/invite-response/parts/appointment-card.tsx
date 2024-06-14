/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import {
	Container,
	Icon,
	Row,
	Tooltip,
	Padding,
	TextWithTooltip
} from '@zextras/carbonio-design-system';
import { pushHistory } from '@zextras/carbonio-shell-ui';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';

import { TagIconComponent } from '../../../commons/tag-icon-component';
import { CALENDAR_ROUTE } from '../../../constants';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';
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
	const [tooltipVisible, setTooltipVisible] = useState(false);

	const onClick = useCallback(() => {
		pushHistory({
			route: CALENDAR_ROUTE,
			path: `${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
		});
	}, [event.resource.calendar.id, event.resource.id, event.resource.ridZ]);

	const eventTimeString = useEventTimeString(event.start, event.end, event.allDay);

	const showInnerTooltip = useCallback(() => {
		setTooltipVisible(true);
	}, []);

	const hideInnerTooltip = useCallback(() => {
		setTooltipVisible(false);
	}, []);

	return (
		<Tooltip
			placement={'top'}
			label={t('label.show_event', 'Double click to see more details on Calendars')}
			disabled={tooltipVisible}
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
						<Icon
							icon="Calendar2"
							size="large"
							color={event.resource.calendar.color.color}
							onMouseEnter={showInnerTooltip}
							onMouseLeave={hideInnerTooltip}
							onFocus={showInnerTooltip}
							onBlur={hideInnerTooltip}
						/>
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
						<TextWithTooltip
							size="medium"
							color={event.resource.calendar.color.color}
							overflow={'ellipsis'}
						>
							{eventTimeString}
						</TextWithTooltip>
						<Row mainAlignment="flex-end" style={{ overflowX: 'visible' }} wrap={'nowrap'}>
							{event.resource.class === 'PRI' && (
								<Tooltip label={t('label.private', 'Private')} placement="top">
									<Padding left="extrasmall">
										<Icon
											color={event.resource.calendar.color.color}
											icon="Lock"
											size="medium"
											onMouseEnter={showInnerTooltip}
											onMouseLeave={hideInnerTooltip}
											onFocus={showInnerTooltip}
											onBlur={hideInnerTooltip}
										/>
									</Padding>
								</Tooltip>
							)}
							{event?.resource?.inviteNeverSent && (
								<Tooltip
									label={t(
										'label.invitation_not_sent',
										"You haven't sent the invitation to the attendees yet"
									)}
									placement="top"
								>
									<Padding left="extrasmall">
										<Icon
											icon="AlertCircleOutline"
											size="medium"
											color="#D74942" // TODO: understand if a custom color is still needed, if so use a constant instead
											onMouseEnter={showInnerTooltip}
											onMouseLeave={hideInnerTooltip}
											onFocus={showInnerTooltip}
											onBlur={hideInnerTooltip}
										/>
									</Padding>
								</Tooltip>
							)}
							{!event?.resource?.calendar?.owner &&
								!event?.resource?.iAmOrganizer &&
								event.resource?.participationStatus === 'NE' && (
									<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
										<Padding left="extrasmall">
											<Icon
												icon="CalendarWarning"
												color="primary"
												size="medium"
												onMouseEnter={showInnerTooltip}
												onMouseLeave={hideInnerTooltip}
												onFocus={showInnerTooltip}
												onBlur={hideInnerTooltip}
											/>
										</Padding>
									</Tooltip>
								)}
							<TagIconComponent event={event} disableOuterTooltip={setTooltipVisible} />
						</Row>
					</Row>
					<Row
						width="fill"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						wrap={'nowrap'}
						style={{ overflowX: 'hidden' }}
					>
						<TextWithTooltip
							size="medium"
							weight="bold"
							color={event.resource.calendar.color.color}
						>
							{event.title}
						</TextWithTooltip>
					</Row>
				</Container>
			</Container>
		</Tooltip>
	);
};
