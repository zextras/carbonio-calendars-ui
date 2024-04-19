/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';

import {
	Container,
	Text,
	Icon,
	Row,
	Tooltip,
	Dropdown,
	Popover,
	useModal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { replaceHistory, t } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';
import { useParams } from 'react-router-dom';

import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { MemoCustomEventComponent } from './custom-event-component';
import { useEventActions } from '../../hooks/use-event-actions';
import { StoreProvider } from '../../store/redux';
import { useSummaryView } from '../../store/zustand/hooks';
import { useAppStatusStore } from '../../store/zustand/store';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { EventType } from '../../types/event';
import { MemoEventSummaryView } from '../event-summary-view/event-summary-view';

type CustomEventProps = {
	event: EventType;
	title: string;
};

const CustomEvent = ({ event, title }: CustomEventProps): ReactElement => {
	const createModal = useModal();
	const anchorRef = useRef(null);
	const { action } = useParams<{ action: string }>();
	const createSnackbar = useSnackbar();
	const summaryViewId = useSummaryView();
	const [tooltipDisabled, setTooltipDisabled] = useState(false);

	const enableOuterTooltip = useCallback(() => {
		setTooltipDisabled(false);
	}, []);

	const disableOuterTooltip = useCallback(() => {
		setTooltipDisabled(true);
	}, []);

	const onEntireSeries = useCallback((): void => {
		replaceHistory(
			`/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}`
		);
	}, [event.resource.calendar.id, event.resource.id]);

	const onSingleInstance = useCallback((): void => {
		replaceHistory(
			`/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
		);
	}, [event?.resource?.calendar?.id, event?.resource?.id, event?.resource?.ridZ]);

	const showPanelView = useCallback(() => {
		if (event?.resource?.class === 'PRI' && !event?.haveWriteAccess) {
			createSnackbar({
				key: `private_appointment`,
				replace: true,
				type: 'info',
				label: t('label.appointment_is_private', 'The appointment is private.'),
				autoHideTimeout: 3000,
				hideButton: true
			});
		} else if (event?.resource?.isRecurrent) {
			const closeModal = createModal(
				{
					children: (
						<StoreProvider>
							<AppointmentTypeHandlingModal
								event={event}
								onClose={(): void => closeModal()}
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
				`/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
			);
		}
	}, [event, createModal, onEntireSeries, onSingleInstance, createSnackbar]);

	const toggleOpen = useCallback(
		(e): void => {
			if (event?.resource?.class === 'PRI' && !event?.haveWriteAccess) {
				createSnackbar({
					key: `private_appointment`,
					replace: true,
					type: 'info',
					label: t('label.appointment_is_private', 'The appointment is private.'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else if (e.detail === 1 && (action === EventActionsEnum.EXPAND || isNil(action))) {
				useAppStatusStore.setState({ summaryViewId: event.id });
			}
		},
		[event?.resource?.class, event?.haveWriteAccess, event.id, action, createSnackbar]
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

	return (
		<>
			<Tooltip
				label={title}
				placement="top"
				disabled={event.resource.class === 'PRI' || tooltipDisabled}
			>
				<Container ref={anchorRef} height="100%" data-testid="calendar-event">
					<Dropdown
						contextMenu
						width="cal(min(100%,12.5rem))"
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
								mainAlignment="flex-start"
							>
								{event.resource.class === 'PRI' && (
									<Tooltip label={t('label.private', 'Private')} placement="top">
										<Row padding={{ right: 'extrasmall' }}>
											<Icon color="currentColor" icon="Lock" style={{ minWidth: '1rem' }} />
										</Row>
									</Tooltip>
								)}
								{event.resource.inviteNeverSent && (
									<Tooltip
										label={t(
											'event.action.invitation_not_sent_yet',
											'The invitation has not been sent yet'
										)}
										placement="bottom"
									>
										<Row padding={{ right: 'extrasmall' }}>
											<Icon color="error" icon="AlertCircleOutline" style={{ minWidth: '1rem' }} />
										</Row>
									</Tooltip>
								)}
								<MemoCustomEventComponent event={event} title={title} />
							</Container>
							{!event.allDay && (
								<Container
									orientation="horizontal"
									width="fill"
									crossAlignment="flex-start"
									mainAlignment="flex-start"
								>
									<Row
										orientation="horizontal"
										wrap="nowrap"
										height="fill"
										crossAlignment="flex-start"
									>
										{event?.resource?.isRecurrent && (
											<Row
												crossAlignment="flex-start"
												height="fill"
												onMouseEnter={disableOuterTooltip}
												onMouseLeave={enableOuterTooltip}
												onFocus={disableOuterTooltip}
												onBlur={enableOuterTooltip}
											>
												<Tooltip
													label={t('label.recurrent_appointment', 'Recurrent appointment')}
													placement="top"
												>
													<Row
														padding={{ vertical: 'extrasmall', right: 'extrasmall' }}
														crossAlignment="flex-start"
													>
														<Icon icon="Repeat" style={{ minWidth: '1rem' }} />
													</Row>
												</Tooltip>
											</Row>
										)}
										<Text
											overflow="break-word"
											color="currentColor"
											style={{ lineHeight: '1.4em' }}
											weight="bold"
										>
											{title}
										</Text>
									</Row>
								</Container>
							)}
						</Container>
					</Dropdown>
				</Container>
			</Tooltip>

			<Popover
				anchorEl={anchorRef}
				open={summaryViewId === event.id}
				styleAsModal
				placement="left"
				onClose={onClose}
			>
				<MemoEventSummaryView event={event} onClose={onClose} inviteId={event.resource.inviteId} />
			</Popover>
		</>
	);
};

export const MemoCustomEvent = React.memo(CustomEvent);
