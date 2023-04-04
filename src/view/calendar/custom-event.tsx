/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isNil } from 'lodash';
import React, { ReactElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	Container,
	Text,
	Icon,
	Row,
	Tooltip,
	Dropdown,
	ModalManagerContext,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { replaceHistory, t, useTags } from '@zextras/carbonio-shell-ui';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEventActions } from '../../hooks/use-event-actions';
import { EventType } from '../../types/event';
import { MemoEventSummaryView } from '../event-summary-view/event-summary-view';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { getInvite } from '../../store/actions/get-invite';
import { MemoCustomEventComponent } from './custom-event-component';
import { AppDispatch, StoreProvider } from '../../store/redux';

type CustomEventProps = {
	event: EventType;
	title: string;
};

const CustomEvent = ({ event, title }: CustomEventProps): ReactElement => {
	const dispatch = useDispatch<AppDispatch>();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const anchorRef = useRef(null);
	const [open, setOpen] = useState(false);
	const { action } = useParams<{ action: string }>();
	const invite = useSelector(selectInstanceInvite(event.resource.inviteId));
	const createSnackbar = useContext(SnackbarManagerContext);
	const getEventInvite = useCallback(() => {
		if (!invite) {
			dispatch(getInvite({ inviteId: event.resource.inviteId, ridZ: event.resource.ridZ }));
		}
	}, [dispatch, event.resource.inviteId, event.resource.ridZ, invite]);

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
			} else {
				getEventInvite();
				if (
					e.detail === 1 &&
					!open &&
					(action === EventActionsEnum.EXPAND || action === EventActionsEnum.EDIT || isNil(action))
				) {
					setOpen(true);
				}
			}
		},
		[event?.resource?.class, event?.haveWriteAccess, createSnackbar, getEventInvite, action, open]
	);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);

	const actions = useEventActions({
		event,
		onClose
	});

	useEffect(() => {
		if (!isNil(action)) {
			setOpen(false);
		}
	}, [action]);

	return (
		<>
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
					onOpen={getEventInvite}
				>
					<Container
						width="fill"
						height="fill"
						background="transparent"
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
							<MemoCustomEventComponent tags={tags} event={event} title={title} />
						</Container>
						{!event.allDay && (
							<Tooltip label={title} placement="top" disabled={event.resource.class === 'PRI'}>
								<Container
									orientation="horizontal"
									width="fill"
									crossAlignment="flex-start"
									mainAlignment="flex-start"
								>
									<Text
										overflow="break-word"
										color="currentColor"
										style={{ lineHeight: '1.4em' }}
										weight="bold"
									>
										{title}
									</Text>
								</Container>
							</Tooltip>
						)}
					</Container>
				</Dropdown>
			</Container>
			{open && (
				<MemoEventSummaryView
					anchorRef={anchorRef}
					event={event}
					open={open}
					invite={invite}
					onClose={onClose}
				/>
			)}
		</>
	);
};

export const MemoCustomEvent = React.memo(CustomEvent);
