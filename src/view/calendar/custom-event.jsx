/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo } from 'react';
import {
	Container,
	Text,
	Icon,
	Row,
	Tooltip,
	Dropdown,
	ModalManagerContext,
	SnackbarManagerContext,
	Padding
} from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useEventActions } from '../../hooks/use-event-actions';

const NeedActionIcon = styled(Icon)`
	position: relative;
	top: -1px;
`;
export default function CustomEvent({ event, title }) {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);
	const actions = useEventActions(
		event,
		{ replaceHistory, dispatch, createModal, createSnackbar },
		t
	);

	const eventDiff = useMemo(
		() => moment(event.end).diff(event.start, 'minutes'),
		[event.start, event.end]
	);
	return (
		<>
			<Dropdown
				contextMenu
				width="cal(min(100%,200px))"
				style={{ width: '100%', height: '100%' }}
				items={actions}
				display="block"
			>
				<Container
					width="fill"
					height="fit"
					background="transparent"
					mainAlignment="center"
					crossAlignment="center"
					style={{ position: 'relative' }}
				>
					<Container
						orientation="horizontal"
						width="fill"
						height="fit"
						crossAlignment="center"
						mainAlignment="flex-start"
					>
						{eventDiff <= 30 ? (
							<Row takeAvailableSpace mainAlignment="flex-start" wrap="no-wrap">
								<Tooltip label={title} placement="top">
									<Row takeAvailableSpace mainAlignment="flex-start" wrap="no-wrap">
										<Text color="currentColor" weight="medium" style={{ overflow: 'visible' }}>
											{`${moment(event.start).format('LT')} -`}
										</Text>
										<Padding left="small" />
										<Text overflow="ellipsis" color="currentColor" weight="bold" size="small">
											{title}
										</Text>
									</Row>
								</Tooltip>
								{!event?.resource?.calendar?.owner &&
									!event?.resource?.iAmOrganizer &&
									event.resource?.participationStatus === 'NE' && (
										<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
											<Row style={{ padding: 'none' }} mainAlignment="center">
												<NeedActionIcon icon="CalendarWarning" color="primary" />
											</Row>
										</Tooltip>
									)}
							</Row>
						) : (
							<Row takeAvailableSpace mainAlignment="flex-start" wrap="no-wrap">
								<Row mainAlignment="space-between" takeAvailableSpace>
									<Tooltip label={title} placement="top">
										<Row takeAvailableSpace mainAlignment="flex-start">
											{!event.allDay && (
												<Text overflow="ellipsis" color="currentColor" weight="medium">
													{`${moment(event.start).format('LT')} - ${moment(event.end).format(
														'LT'
													)}`}
												</Text>
											)}
										</Row>
									</Tooltip>
									{!event?.resource?.calendar?.owner &&
										!event?.resource?.iAmOrganizer &&
										event.resource?.participationStatus === 'NE' && (
											<Tooltip
												placement="top"
												label={t('event.action.needs_action', 'Needs action')}
											>
												<Row style={{ padding: 'none' }} mainAlignment="center">
													<NeedActionIcon icon="CalendarWarning" color="primary" />
												</Row>
											</Tooltip>
										)}
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
							</Row>
						)}
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
		</>
	);
}
