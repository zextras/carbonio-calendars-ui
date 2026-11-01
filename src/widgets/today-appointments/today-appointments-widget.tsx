/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { Container, Divider, Row, Shimmer, Text } from '@zextras/carbonio-design-system';
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import { format } from 'date-fns';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useTodayAppointments } from './use-today-appointments';
import { formatDuration, getEventPath, groupEventsByAccount } from './utils';
import { getTimeOnlyToken, useIs24HourFormat } from '../../commons/time-format';
import type { EventType } from '../../types/event';

const EventRow = ({ event }: { event: EventType }): React.JSX.Element => {
	const [t] = useTranslation();
	const { pushHistory } = useHistoryNavigation();
	const is24h = useIs24HourFormat();
	const onClick = useCallback(() => pushHistory(getEventPath(event)), [event, pushHistory]);

	const time = event.allDay
		? t('label.all_day', 'All day')
		: format(event.start, getTimeOnlyToken(is24h));
	const duration = event.allDay ? '' : formatDuration(event.end.getTime() - event.start.getTime());

	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			height="fit"
			gap="0.5rem"
			padding={{ vertical: 'small', horizontal: 'medium' }}
			style={{ cursor: 'pointer' }}
			role="button"
			tabIndex={0}
			data-testid={`today-appointment-${event.id}`}
			onClick={onClick}
			onKeyDown={(e): void => {
				if (e.key === 'Enter' || e.key === ' ') onClick();
			}}
		>
			<Text weight="bold" style={{ flexShrink: 0 }}>
				{time}
			</Text>
			<Text color="secondary" style={{ flexShrink: 0 }}>
				{duration}
			</Text>
			<Row takeAvailableSpace mainAlignment="flex-start" style={{ minWidth: 0 }}>
				<Text overflow="ellipsis">{event.title}</Text>
			</Row>
		</Container>
	);
};

export const TodayAppointmentsWidget = (): React.JSX.Element => {
	const [t] = useTranslation();
	const events = useTodayAppointments();
	const userAccountName = getUserAccount()?.name ?? '';
	const groups = useMemo(
		() => (events ? groupEventsByAccount(events, userAccountName) : []),
		[events, userAccountName]
	);

	if (!events) {
		return (
			<Container padding={{ all: 'medium' }} gap="0.5rem" data-testid="today-appointments-loading">
				<Shimmer.ListItem />
				<Shimmer.ListItem />
			</Container>
		);
	}

	if (!events.length) {
		return (
			<Container data-testid="today-appointments-empty">
				<Text color="secondary">
					{t('widget.today_appointments.empty', 'No appointments today')}
				</Text>
			</Container>
		);
	}

	return (
		<Container mainAlignment="flex-start" crossAlignment="stretch" style={{ overflowY: 'auto' }}>
			{map(groups, (group) => (
				<Container key={group.account} height="fit" crossAlignment="stretch">
					<Container
						height="fit"
						crossAlignment="flex-start"
						padding={{ vertical: 'small', horizontal: 'medium' }}
					>
						<Text color="secondary" size="small" weight="bold" overflow="ellipsis">
							{group.account}
						</Text>
					</Container>
					{map(group.events, (event) => (
						<EventRow key={event.id} event={event} />
					))}
					<Divider />
				</Container>
			))}
		</Container>
	);
};
