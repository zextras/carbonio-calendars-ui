/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	Dispatch,
	ReactElement,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';

import {
	Container,
	Text,
	Icon,
	Row,
	Tooltip,
	Dropdown,
	Popover,
	useModal,
	useSnackbar,
	Padding
} from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { TagIconComponent } from '../../commons/tag-icon-component';
import { EVENT_ACTIONS } from '../../constants/event-actions';
import { useEventActions } from '../../hooks/use-event-actions';
import { StoreProvider } from '../../store/redux';
import { useSummaryView } from '../../store/zustand/hooks';
import { useAppStatusStore } from '../../store/zustand/store';
import { EventType } from '../../types/event';
import { MemoEventSummaryView } from '../event-summary-view/event-summary-view';

type CustomEventProps = {
	event: EventType;
	title: string;
};

const AlignedIcon = styled(Icon)`
	position: relative;
	top: -0.0625rem;
`;

const CustomEventTitle = ({
	title,
	overflow = 'break-word'
}: {
	title: CustomEventProps['title'];
	overflow?: 'ellipsis' | 'visible' | 'break-word';
}): ReactElement => (
	<Text size={'small'} color="currentColor" style={{ overflow }}>
		{title}
	</Text>
);

const CustomEventIcon = ({
	isIconVisible,
	tooltipLabel,
	iconColor,
	iconName,
	disableOuterTooltip
}: {
	isIconVisible: boolean;
	tooltipLabel: string;
	iconColor?: string;
	iconName: string;
	disableOuterTooltip: Dispatch<SetStateAction<boolean>>;
}): ReactElement | null =>
	isIconVisible ? (
		<Tooltip label={tooltipLabel} placement="top">
			<Row
				padding={{ right: 'extrasmall' }}
				onMouseEnter={(): void => disableOuterTooltip(true)}
				onMouseLeave={(): void => disableOuterTooltip(false)}
				onFocus={(): void => disableOuterTooltip(true)}
				onBlur={(): void => disableOuterTooltip(false)}
			>
				<AlignedIcon color={iconColor} icon={iconName} style={{ minWidth: '1rem' }} />
			</Row>
		</Tooltip>
	) : null;

const CustomEvent = ({ event, title }: CustomEventProps): ReactElement => {
	const { createModal, closeModal } = useModal();
	const anchorRef = useRef(null);
	const { action } = useParams<{ action: string }>();
	const createSnackbar = useSnackbar();
	const summaryViewId = useSummaryView();
	const [t] = useTranslation();
	const [isOuterTooltipDisabled, setIsOuterTooltipDisabled] = useState(false);
	const recurrentLabel = t('label.recurrent', 'Recurrent appointment');

	const eventDiff = useMemo(
		() => moment(event.end).diff(event.start, 'minutes'),
		[event.start, event.end]
	);

	const onEntireSeries = useCallback((): void => {
		replaceHistory(`/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}`);
	}, [event.resource.calendar.id, event.resource.id]);

	const onSingleInstance = useCallback((): void => {
		replaceHistory(
			`/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
		);
	}, [event?.resource?.calendar?.id, event?.resource?.id, event?.resource?.ridZ]);

	const showPanelView = useCallback(() => {
		if (event?.resource?.class === 'PRI' && !event?.haveWriteAccess) {
			createSnackbar({
				key: `private_appointment`,
				replace: true,
				severity: 'info',
				label: t('label.appointment_is_private', 'The appointment is private.'),
				autoHideTimeout: 3000,
				hideButton: true
			});
		} else if (event?.resource?.isRecurrent) {
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
				`/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
			);
		}
	}, [event, createSnackbar, t, createModal, onEntireSeries, onSingleInstance, closeModal]);

	const toggleOpen = useCallback(
		(e: React.MouseEvent): void => {
			if (event?.resource?.class === 'PRI' && !event?.haveWriteAccess) {
				createSnackbar({
					key: `private_appointment`,
					replace: true,
					severity: 'info',
					label: t('label.appointment_is_private', 'The appointment is private.'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else if (e.detail === 1 && (action === EVENT_ACTIONS.EXPAND || isNil(action))) {
				useAppStatusStore.setState({ summaryViewId: event.id });
			}
		},
		[event?.resource?.class, event?.haveWriteAccess, event.id, action, createSnackbar, t]
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

	const textOverflow = useMemo(
		() => (hasTags || event.resource.isRecurrent ? 'ellipsis' : 'visible'),
		[event.resource.isRecurrent, hasTags]
	);

	return (
		<>
			<Tooltip
				label={title}
				placement="top"
				disabled={event.resource.class === 'PRI' || isOuterTooltipDisabled}
			>
				<Container
					height="100%"
					data-testid="calendar-event"
					style={{ padding: '0.15rem 0.25rem' }}
				>
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
								mainAlignment="center"
							>
								{event.allDay && event.resource.isRecurrent && (
									<CustomEventIcon
										iconName={'Repeat'}
										iconColor={'currentColor'}
										isIconVisible={event.resource.isRecurrent}
										tooltipLabel={recurrentLabel}
										disableOuterTooltip={setIsOuterTooltipDisabled}
									/>
								)}
								{event.resource.inviteNeverSent && (
									<CustomEventIcon
										tooltipLabel={t(
											'event.action.invitation_not_sent_yet',
											'The invitation has not been sent yet'
										)}
										isIconVisible={event.resource.inviteNeverSent}
										iconColor={'error'}
										iconName={'AlertCircleOutline'}
										disableOuterTooltip={setIsOuterTooltipDisabled}
									/>
								)}
								{event.resource.class === 'PRI' && (
									<CustomEventIcon
										tooltipLabel={t('label.private', 'Private')}
										isIconVisible={event.resource.class === 'PRI'}
										iconColor={'currentColor'}
										iconName={'Lock'}
										disableOuterTooltip={setIsOuterTooltipDisabled}
									/>
								)}
								{!event?.resource?.calendar?.owner &&
									!event?.resource?.iAmOrganizer &&
									event.resource?.participationStatus === 'NE' && (
										<CustomEventIcon
											iconColor={'primary'}
											iconName={'CalendarWarning'}
											isIconVisible={
												!event?.resource?.calendar?.owner &&
												!event?.resource?.iAmOrganizer &&
												event.resource?.participationStatus === 'NE'
											}
											tooltipLabel={t('event.action.needs_action', 'Needs action')}
											disableOuterTooltip={setIsOuterTooltipDisabled}
										/>
									)}
								<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
									<Row
										ref={anchorRef}
										crossAlignment="flex-start"
										mainAlignment="space-between"
										takeAvailableSpace
									>
										<>
											{!event.allDay && (
												<Row
													takeAvailableSpace
													crossAlignment="flex-start"
													mainAlignment="flex-start"
													wrap="nowrap"
												>
													<Text
														color="currentColor"
														size={'small'}
														style={{
															overflow: textOverflow
														}}
													>
														{`${moment(event.start).format('LT')} - ${moment(event.end).format(
															'LT'
														)}`}
													</Text>
													<Padding left="small" />
													{eventDiff <= 29 && (
														<>
															{event.resource.isRecurrent && (
																<CustomEventIcon
																	iconName={'Repeat'}
																	iconColor={'currentColor'}
																	isIconVisible={event.resource.isRecurrent}
																	tooltipLabel={recurrentLabel}
																	disableOuterTooltip={setIsOuterTooltipDisabled}
																/>
															)}
															<CustomEventTitle title={title} />
														</>
													)}
												</Row>
											)}
											{event.allDay && <CustomEventTitle title={title} overflow={textOverflow} />}
										</>
									</Row>
									<TagIconComponent event={event} disableOuterTooltip={setIsOuterTooltipDisabled} />
								</Row>
							</Container>
							{eventDiff >= 30 && event.resource.class !== 'PRI' && !event.allDay && (
								<>
									<Padding top="extrasmall" />
									<Row wrap="nowrap">
										{event.resource.isRecurrent && (
											<CustomEventIcon
												iconName={'Repeat'}
												iconColor={'currentColor'}
												isIconVisible={event.resource.isRecurrent}
												tooltipLabel={recurrentLabel}
												disableOuterTooltip={setIsOuterTooltipDisabled}
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
