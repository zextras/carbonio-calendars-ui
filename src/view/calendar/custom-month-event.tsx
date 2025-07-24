/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useRef } from 'react';

import { Container, Dropdown, Text, Tooltip, useModal } from '@zextras/carbonio-design-system';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import { isNil } from 'lodash';
import moment from 'moment/moment';
import { useParams } from 'react-router-dom';

import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { CustomEventFreeBusyStatus } from './custom-event-free-busy-status';
import { CALENDAR_ROUTE } from '../../constants';
import { EVENT_ACTIONS } from '../../constants/event-actions';
import { useEventActions } from '../../hooks/use-event-actions';
import { StoreProvider } from '../../store/redux';
import { useAppStatusStore } from '../../store/zustand/store';
import { EventType } from '../../types/event';

export const CustomMonthEvent = ({
	event,
	title
}: {
	event: EventType;
	title: string;
}): React.JSX.Element => {
	const { createModal, closeModal } = useModal();
	const { action } = useParams<{ action: string }>();
	const anchorRef = useRef<HTMLDivElement | null>(null);
	const { replaceHistory } = useHistoryNavigation();

	const onEntireSeries = useCallback((): void => {
		replaceHistory(
			`/${CALENDAR_ROUTE}/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}`
		);
	}, [event.resource.calendar.id, event.resource.id, replaceHistory]);

	const onSingleInstance = useCallback((): void => {
		replaceHistory(
			`/${CALENDAR_ROUTE}/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
		);
	}, [event.resource.calendar.id, event.resource.id, event.resource.ridZ, replaceHistory]);

	const showPanelView = useCallback(() => {
		if (event?.resource?.isRecurrent) {
			const modalId = 'modify-recurrent-appointment';
			createModal(
				{
					id: modalId,
					children: (
						<StoreProvider>
							<AppointmentTypeHandlingModal
								event={event}
								onClose={(): void => closeModal(modalId)}
								onSeries={onEntireSeries}
								onInstance={onSingleInstance}
							/>
						</StoreProvider>
					)
				},
				true
			);
		} else {
			replaceHistory(
				`/${CALENDAR_ROUTE}/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
			);
		}
	}, [event, createModal, onEntireSeries, onSingleInstance, closeModal, replaceHistory]);

	const toggleOpen = useCallback(
		(e: React.MouseEvent): void => {
			if (e.detail === 1 && (action === EVENT_ACTIONS.EXPAND || isNil(action))) {
				useAppStatusStore.setState({ summaryViewId: event.id });
				useAppStatusStore.setState({ summaryViewRef: anchorRef });
			}
		},
		[event.id, action]
	);

	const textOverflow = useMemo(
		() => (event.resource.isRecurrent || event.allDay ? 'ellipsis' : 'visible'),
		[event.allDay, event.resource.isRecurrent]
	);

	const timeToDisplay = useMemo(() => {
		const isSameDay = moment(event.start).isSame(moment(event.end), 'day');
		const isSameMonth = moment(event.start).isSame(moment(event.end), 'month');
		const isSameYear = moment(event.start).isSame(moment(event.end), 'year');

		if (!isSameYear) {
			return `${moment(event.start).format('Y/MM/DD, LT')} `;
		}
		if (!isSameMonth) {
			return `${moment(event.start).format('ddd MM/DD, LT')} `;
		}
		if (!isSameDay) {
			return `${moment(event.start).format('ddd DD, LT')} `;
		}
		return `${moment(event.start).format('LT')} `;
	}, [event.end, event.start]);

	const actions = useEventActions({
		event
	});

	return (
		<CustomEventFreeBusyStatus
			color={event.resource.calendar.color.color}
			background={event.resource.calendar.color.background}
			freeBusyActual={event.resource.freeBusyActual}
		>
			<Tooltip
				label={title}
				placement="top"
				disabled={event.resource.class === 'PRI'}
				triggerRef={anchorRef}
			>
				<Container
					height="100%"
					style={{
						borderLeft: `0.0625rem solid ${event.resource.calendar.color.color}`,
						padding: '0.25rem'
					}}
					background={event.resource.calendar.color.background}
				>
					<Dropdown
						contextMenu
						width="min(100%,12.5rem)"
						style={{ width: '100%', height: '100%' }}
						items={actions ?? []}
						display="block"
						onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent> | Event): void => {
							if (e) (e as Event)?.stopImmediatePropagation?.();
						}}
					>
						<Container
							padding={{ left: '0.5rem' }}
							width="fill"
							height="fill"
							background={'transparent'}
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							onDoubleClick={showPanelView}
							onClick={toggleOpen}
							data-testid="calendar-event-inner-container"
						>
							<Text
								size={'small'}
								color="currentColor"
								style={{ overflow: textOverflow }}
								weight="bold"
							>
								{timeToDisplay.concat(title)}
							</Text>
						</Container>
					</Dropdown>
				</Container>
			</Tooltip>
		</CustomEventFreeBusyStatus>
	);
};
