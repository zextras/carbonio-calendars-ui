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
	ModalManagerContext
} from '@zextras/carbonio-design-system';
import { replaceHistory, t, useTags } from '@zextras/carbonio-shell-ui';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEventSummaryViewActions } from '../../hooks/use-event-summary-view-actions';
import { EventType } from '../../types/event';
import { EventSummaryView } from '../event-summary-view/event-summary-view';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { getInvite } from '../../store/actions/get-invite';
import { CustomEventComponent } from './custom-event-component';
import { StoreProvider } from '../../store/redux';

type CustomEventProps = {
	event: EventType;
	title: string;
};

export const CustomEvent = ({ event, title }: CustomEventProps): ReactElement => {
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const anchorRef = useRef(null);
	const [open, setOpen] = useState(false);
	const { action } = useParams<{ action: string }>();
	const invite = useSelector(selectInstanceInvite(event.resource.inviteId));

	const getEventInvite = useCallback(() => {
		if (!invite) {
			dispatch(getInvite({ inviteId: event.resource.inviteId, ridZ: event.resource.ridZ }));
		}
	}, [dispatch, event.resource.inviteId, event.resource.ridZ, invite]);

	const showPanelView = useCallback(() => {
		if (event?.resource?.isRecurrent) {
			// I'm disabling lint as the DS is not defining the type
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const closeModal = createModal(
				{
					children: (
						<StoreProvider>
							<AppointmentTypeHandlingModal event={event} onClose={(): void => closeModal()} />
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
	}, [event, createModal]);

	const toggleOpen = useCallback(
		(e) => {
			if (!invite) {
				dispatch(getInvite({ inviteId: event.resource.inviteId, ridZ: event.resource.ridZ }));
			}
			if (e.detail === 1 && isNil(action) && !open) {
				setOpen(true);
			}
		},
		[action, dispatch, event.resource.inviteId, event.resource.ridZ, invite, open]
	);

	const actions = useEventSummaryViewActions({
		event
	});

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);

	useEffect(() => {
		if (!isNil(action)) {
			setOpen(false);
		}
	}, [action]);

	return (
		<>
			<Container ref={anchorRef} onClick={toggleOpen} height="100%">
				<Dropdown
					contextMenu
					width="cal(min(100%,200px))"
					style={{ width: '100%', height: '100%' }}
					items={actions}
					display="block"
					onOpen={getEventInvite}
				>
					<Container
						width="fill"
						height="fill"
						background="transparent"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						onDoubleClick={showPanelView}
					>
						<Container
							orientation="horizontal"
							width="fill"
							height="fit"
							crossAlignment="center"
							mainAlignment="flex-start"
						>
							<CustomEventComponent tags={tags} event={event} title={title} />
							{event.resource.class === 'PRI' && (
								<Tooltip label={t('label.private', 'Private')} placement="top">
									<Row padding={{ left: 'extrasmall' }}>
										<Icon color="currentColor" icon="Lock" style={{ minWidth: '16px' }} />
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
									<Row padding={{ left: 'extrasmall' }}>
										<Icon color="error" icon="AlertCircleOutline" style={{ minWidth: '16px' }} />
									</Row>
								</Tooltip>
							)}
						</Container>
						{!event.allDay && (
							<Tooltip label={title} placement="top">
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
				<EventSummaryView
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
