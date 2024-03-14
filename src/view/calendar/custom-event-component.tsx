/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TagIconComponent } from '../../commons/tag-icon-component';
import { EventType } from '../../types/event';

const NeedActionIcon = styled(Icon)`
	position: relative;
	top: -0.0625rem;
`;

type CustomEventComponentProps = {
	event: EventType;
	title: string;
};

const CustomEventComponent = ({ event, title }: CustomEventComponentProps): ReactElement => {
	const [t] = useTranslation();
	const eventDiff = useMemo(
		() => moment(event.end).diff(event.start, 'minutes'),
		[event.start, event.end]
	);

	return eventDiff <= 30 ? (
		<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
			{!event?.resource?.calendar?.owner &&
				!event?.resource?.iAmOrganizer &&
				event.resource?.participationStatus === 'NE' && (
					<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
						<Row style={{ padding: 'none' }} mainAlignment="center">
							<Padding right="extrasmall">
								<NeedActionIcon icon="CalendarWarning" color="primary" />
							</Padding>
						</Row>
					</Tooltip>
				)}
			<Tooltip label={title} placement="top" disabled={event.resource.class === 'PRI'}>
				<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
					<Text color="currentColor" weight="medium" style={{ overflow: 'visible' }}>
						{`${moment(event.start).format('LT')} - ${moment(event.end).format('LT')}`}
					</Text>
					<Padding left="small" />
					{eventDiff <= 15 && (
						<Text overflow="ellipsis" color="currentColor" weight="bold" size="small">
							{title}
						</Text>
					)}
				</Row>
			</Tooltip>
			{/* {event?.resource?.isException && (
				<Padding left="small">
					<Icon
						data-testid="ExceptionIcon"
						icon="RepeatException"
						color={event.resource.calendar.color.color}
					/>
				</Padding>
			)} */}
			<TagIconComponent event={event} />
		</Row>
	) : (
		<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
			<Row mainAlignment="space-between" takeAvailableSpace>
				{!event?.resource?.calendar?.owner &&
					!event?.resource?.iAmOrganizer &&
					event.resource?.participationStatus === 'NE' && (
						<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
							<Row style={{ padding: 'none' }} mainAlignment="center">
								<Padding right="extrasmall">
									<NeedActionIcon icon="CalendarWarning" color="primary" />
								</Padding>
							</Row>
						</Tooltip>
					)}
				<Tooltip label={title} placement="top" disabled={event.resource.class === 'PRI'}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						{!event.allDay && (
							<Text overflow="ellipsis" color="currentColor" weight="medium">
								{`${moment(event.start).format('LT')} - ${moment(event.end).format('LT')}`}
							</Text>
						)}
					</Row>
				</Tooltip>
			</Row>
			<Tooltip label={title} placement="top">
				<Row>
					{event.allDay && (
						<Padding left="small">
							<Text overflow="break-word" color="currentColor" weight="bold">
								{title}
							</Text>
						</Padding>
					)}
				</Row>
			</Tooltip>
			{/* {event?.resource?.isException && (
				<Padding left="small">
					<Icon
						data-testid="ExceptionIcon"
						icon="RepeatException"
						color={event.resource.calendar.color.color}
					/>
				</Padding>
			)} */}
			<TagIconComponent event={event} />
		</Row>
	);
};

export const MemoCustomEventComponent = React.memo(CustomEventComponent);
