/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react';

import {
	Container,
	Text,
	Row,
	Tooltip,
	Dropdown,
	useModal,
	Padding
} from '@zextras/carbonio-design-system';
import { useHistoryNavigation, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { isNil } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { CustomEventFreeBusyStatus } from './custom-event-free-busy-status';
import { CustomEventIcon } from './custom-event-icon';
import { CustomEventReplyIcons } from './custom-event-reply-icons';
import { TagIconComponent } from 'commons/tag-icon-component';
import { isExternalSyncFolder, isIcsOrCaldavExternalFolder } from 'commons/utilities';
import { EVENT_ACTIONS } from 'constants/event-actions';
import { CALENDAR_ROUTE } from 'constants/index';
import { useEventActions } from 'hooks/use-event-actions';
import { useNeverSentWarningLabel } from 'hooks/use-never-sent-warning-label';
import { StoreProvider } from 'store/redux';
import { useAppStatusStore } from 'store/zustand/store';
import { EventType } from 'types/event';

type CustomEventProps = {
	event: EventType;
	title: string;
};

const CustomEventTitle = ({
	title,
	overflow = 'break-word'
}: {
	title: CustomEventProps['title'];
	overflow?: 'ellipsis' | 'visible' | 'break-word';
}): ReactElement | null =>
	title ? (
		<Text
			data-testid={'event-title'}
			size={'small'}
			color="currentColor"
			style={{ overflow }}
			weight="bold"
		>
			{title}
		</Text>
	) : null;

const CustomDate = ({
	textOverflow,
	start,
	end
}: {
	textOverflow: string;
	start: moment.Moment;
	end: moment.Moment;
}): React.JSX.Element => {
	const timeToDisplay = useMemo(() => {
		const isSameDay = moment(start).isSame(moment(end), 'day');
		const isSameMonth = moment(start).isSame(moment(end), 'month');
		const isSameYear = moment(start).isSame(moment(end), 'year');

		if (!isSameYear) {
			return `${start.format('Y/MM/DD, LT')} - ${end.format('Y/MM/DD, LT')}`;
		}
		if (!isSameMonth) {
			return `${start.format('ddd MM/DD, LT')} - ${end.format('ddd MM/DD, LT')}`;
		}
		if (!isSameDay) {
			return `${start.format('ddd DD, LT')} - ${end.format('ddd DD, LT')}`;
		}
		return `${start.format('LT')} - ${end.format('LT')}`;
	}, [end, start]);

	return (
		<Container crossAlignment={'flex-start'}>
			<Text
				color="currentColor"
				size={'small'}
				style={{
					overflow: textOverflow
				}}
			>
				{timeToDisplay}
			</Text>
		</Container>
	);
};

const CustomEvent = ({ event, title }: CustomEventProps): ReactElement => {
	const { createModal, closeModal } = useModal();
	const anchorRef = useRef<HTMLDivElement | null>(null);
	const { action } = useParams<{ action: string }>();
	const [t] = useTranslation();
	const recurrentLabel = t('label.recurrent', 'Recurrent appointment');
	const { replaceHistory } = useHistoryNavigation();

	const eventDiff = useMemo(
		() => moment(event.end).diff(event.start, 'minutes'),
		[event.start, event.end]
	);

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
					),
					onClose: () => {
						closeModal(modalId);
					}
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

	const onClose = useCallback(() => {
		useAppStatusStore.setState({ summaryViewId: undefined });
	}, []);

	const actions = useEventActions({
		event,
		onClose
	});

	useEffect(() => {
		if (!isNil(action)) {
			useAppStatusStore.setState({ summaryViewId: undefined });
		}
	}, [action]);

	const hasTags = useMemo(
		() =>
			event?.resource?.tags &&
			event?.resource?.tags?.length !== 0 &&
			event?.resource?.tags?.[0] !== '',
		[event?.resource?.tags]
	);

	const folders = useFoldersMap();
	const folder = folders[event.resource.calendar.id];
	const eventIsFromExternalCalendar = isIcsOrCaldavExternalFolder(folder ?? {});
	const eventIsFromIcsCalendar = isExternalSyncFolder(folder ?? {});

	const textOverflow = useMemo(
		() => (hasTags || event.resource.isRecurrent || event.allDay ? 'ellipsis' : 'visible'),
		[event.allDay, event.resource.isRecurrent, hasTags]
	);

	const innerContainerPadding = eventDiff >= 30 ? '0.25rem 0.25rem' : '0 0.125rem';
	const displayedFreeBusy = eventIsFromExternalCalendar
		? event.resource.freeBusy
		: event.resource.freeBusyActual;

	const iAmAttendee =
		!eventIsFromExternalCalendar &&
		event.haveWriteAccess &&
		event.resource.iAmAttendee &&
		!event?.resource?.calendar?.owner &&
		!event?.resource?.iAmOrganizer;
	const neverSentWarningLabel = useNeverSentWarningLabel();

	return (
		<CustomEventFreeBusyStatus
			color={event.resource.calendar.color.color}
			background={event.resource.calendar.color.background}
			freeBusyActual={displayedFreeBusy}
		>
			<Tooltip label={title} placement="top" disabled={!title} triggerRef={anchorRef}>
				<Container
					height="100%"
					style={{
						padding: innerContainerPadding,
						borderLeft: `0.0625rem solid ${event.resource.calendar.color.color}`
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
							width="fill"
							height="fill"
							background={'transparent'}
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							onDoubleClick={showPanelView}
							onClick={toggleOpen}
							data-testid="calendar-event-inner-container"
						>
							<Container
								orientation="horizontal"
								width="fill"
								height="fit"
								crossAlignment="center"
								mainAlignment="center"
							>
								{event.allDay && event.resource.isRecurrent && (
									<CustomEventIcon
										iconName={'Repeat'}
										iconColor={'currentColor'}
										isIconVisible={event.resource.isRecurrent}
										tooltipLabel={recurrentLabel}
									/>
								)}
								{event.resource.inviteNeverSent && (
									<CustomEventIcon
										tooltipLabel={neverSentWarningLabel}
										isIconVisible={event.resource.inviteNeverSent}
										iconColor={'error'}
										iconName={'AlertCircleOutline'}
									/>
								)}
								<CustomEventIcon
									tooltipLabel={t('label.private', 'Private')}
									isIconVisible={event.resource.class === 'PRI'}
									iconColor={'currentColor'}
									iconName={'Lock'}
								/>
								<CustomEventReplyIcons
									iAmAttendee={iAmAttendee}
									participationStatus={event.resource.participationStatus}
								/>
								<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
									<Row crossAlignment="flex-start" mainAlignment="space-between" takeAvailableSpace>
										{!event.allDay && (
											<Row
												takeAvailableSpace
												crossAlignment="flex-start"
												mainAlignment="flex-start"
												wrap="nowrap"
											>
												<CustomDate
													start={moment(event.start)}
													end={moment(event.end)}
													textOverflow={textOverflow}
												/>
												<Padding left="small" />
												{eventDiff <= 29 && (
													<>
														{event.resource.isRecurrent && (
															<CustomEventIcon
																iconName={'Repeat'}
																iconColor={'currentColor'}
																isIconVisible={event.resource.isRecurrent}
																tooltipLabel={recurrentLabel}
															/>
														)}
														<CustomEventTitle title={title} />
													</>
												)}
												{eventIsFromIcsCalendar && (
													<CustomEventIcon
														iconName={'Link2'}
														iconColor={'currentColor'}
														isIconVisible
														tooltipLabel={t(
															'label.external_calendar_event',
															'Event from an ICS calendar added from URL'
														)}
													/>
												)}
											</Row>
										)}
										{event.allDay && <CustomEventTitle title={title} overflow={textOverflow} />}
									</Row>
									<TagIconComponent event={event} />
								</Row>
							</Container>
							{eventDiff >= 30 && !event.allDay && (
								<>
									{eventDiff >= 45 && <Padding top="extrasmall" />}
									<Row wrap="nowrap">
										{event.resource.isRecurrent && (
											<CustomEventIcon
												iconName={'Repeat'}
												iconColor={'currentColor'}
												isIconVisible={event.resource.isRecurrent}
												tooltipLabel={recurrentLabel}
											/>
										)}
										<CustomEventTitle title={title} />
									</Row>
								</>
							)}
						</Container>
					</Dropdown>
				</Container>
			</Tooltip>
		</CustomEventFreeBusyStatus>
	);
};

export const MemoCustomEvent = React.memo(CustomEvent);
