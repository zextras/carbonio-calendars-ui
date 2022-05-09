/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from 'styled-components';
import {
	Button,
	Dropdown,
	Icon,
	SnackbarManagerContext,
	ModalManagerContext,
	Padding,
	Row,
	Text,
	Container
} from '@zextras/carbonio-design-system';
import React, { useState, useCallback, useContext, useMemo } from 'react';
import { map, toUpper } from 'lodash';
import { FOLDERS, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { updateParticipationStatus } from '../../store/slices/appointments-slice';
import OrganizerActions from './parts/organizer-actions';
import { useGetRecurrentActions } from '../../hooks/use-recurrent-actions';
import { useEventActions } from '../../hooks/use-event-actions';

const AttendingRow = styled(Row)`
	border: 1px solid ${(props) => props.theme.palette[props.invtReply.color].regular};
`;

const RecurrentRow = styled(Row)`
	border: 1px solid ${(props) => props.theme.palette.primary.regular};
`;

const ReplyButtonsPartSmall = ({ participationStatus, inviteId, compNum, dispatch, event }) => {
	const [t] = useTranslation();
	const decline = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'DECLINE',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'DE' })));
		},
		[dispatch, inviteId, compNum]
	);
	const tentative = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'TENTATIVE',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'TE' })));
		},
		[dispatch, inviteId, compNum]
	);
	const accept = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'ACCEPT',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'AC' })));
		},
		[dispatch, inviteId, compNum]
	);

	const attendeesOptions = [
		{
			id: 'option_2',
			icon: 'CheckmarkCircle2',
			label: toUpper(t('event.action.yes', 'Yes')),
			value: 'AC',
			action: accept,
			color: 'success',
			customComponent: (
				<Row>
					<Padding right="small">
						<Icon color="success" icon="CheckmarkCircle2" />
					</Padding>
					<Padding right="small">
						<Text>{toUpper(t('event.action.yes', 'Yes'))}</Text>
					</Padding>
				</Row>
			)
		},
		{
			id: 'option_3',
			icon: 'QuestionMarkCircle',
			label: toUpper(t('label.tentative', 'Tentative')),
			value: 'TE',
			action: tentative,
			color: 'warning',
			customComponent: (
				<Row>
					<Padding right="small">
						<Icon color="warning" icon="QuestionMarkCircle" />
					</Padding>
					<Padding right="small">
						<Text>{toUpper(t('label.tentative', 'Tentative'))}</Text>
					</Padding>
				</Row>
			)
		},
		{
			id: 'option_1',
			icon: 'CloseCircle',
			label: toUpper(t('event.action.no', 'No')),
			value: 'NO',
			action: decline,
			color: 'error',
			customComponent: (
				<Row>
					<Padding right="small">
						<Icon color="error" icon="CloseCircle" />
					</Padding>
					<Padding right="small">
						<Text>{toUpper(t('event.action.no', 'No'))}</Text>
					</Padding>
				</Row>
			)
		}
	];

	const attendingResponse = (value) => {
		switch (value) {
			case 'TE':
				return {
					id: 'option_3',
					icon: 'QuestionMarkCircle',
					label: toUpper(t('label.tentative', 'Tentative')),
					value: 'TE',
					action: '',
					color: 'warning',
					selected: false
				};
			case 'AC':
				return {
					id: 'option_2',
					icon: 'CheckmarkCircle2',
					label: toUpper(t('event.action.yes', 'Yes')),
					value: 'AC',
					action: '',
					color: 'success',
					selected: false
				};

			case 'DE':
				return {
					id: 'option_1',
					icon: 'CloseCircle',
					label: toUpper(t('event.action.no', 'No')),
					value: 'DE',
					action: '',
					color: 'error'
				};
			default:
				return {
					id: 'option_4',
					icon: 'CalendarWarning',
					label: toUpper(t('event.action.needs_action', 'Needs action')),
					value: 'NE',
					color: 'primary'
				};
		}
	};

	const [invtReply, setInvtReply] = useState(attendingResponse(participationStatus));
	const createModal = useContext(ModalManagerContext);

	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo(
		() => ({ replaceHistory, dispatch, createModal, createSnackbar, tags }),
		[createModal, createSnackbar, dispatch, tags]
	);

	const actions = useEventActions(event, context, t, false);

	return (
		<Container orientation="horizontal" mainAlignment="flex-end">
			<Dropdown
				disableAutoFocus
				items={map(attendeesOptions, (action) => ({
					id: action.label,
					icon: action.icon,
					label: action.label,
					key: action.id,
					color: action.color,
					customComponent: action.customComponent,
					click: (ev) => {
						ev.stopPropagation();
						action.action();
						setInvtReply(action);
					}
				}))}
				style={{ cursor: 'pointer' }}
				placement="bottom-end"
			>
				<AttendingRow padding={{ all: 'small' }} invtReply={invtReply}>
					<Row>
						<Icon color={invtReply.color} icon={invtReply.icon} />
					</Row>

					<Row>
						<Padding horizontal="small">
							<Text color={invtReply.color}>{invtReply.label}</Text>
						</Padding>
						<Icon color={invtReply.color} icon="ArrowIosDownwardOutline" />
					</Row>
				</AttendingRow>
			</Dropdown>
			<Padding left="small">
				<Dropdown
					disableAutoFocus
					items={map(actions, (action) => ({
						id: action.label,
						icon: action.icon,
						label: action.label,
						key: action.id,
						color: action.color,
						items: action.items,
						customComponent: action.customComponent,
						click: (ev) => {
							ev.stopPropagation();
							action.click();
						}
					}))}
					placement="bottom-end"
				>
					<Button
						type="outlined"
						label={t('label.other_actions', 'Other actions')}
						icon="ArrowIosDownwardOutline"
						style={{ padding: '7px 4px' }}
					/>
				</Dropdown>
			</Padding>
		</Container>
	);
};

export const ActionsButtonsRow = ({ event, dispatch, onClose }) => {
	const createModal = useContext(ModalManagerContext);

	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo(
		() => ({ replaceHistory, dispatch, createModal, createSnackbar, tags, onClose }),
		[createModal, createSnackbar, dispatch, tags, onClose]
	);
	const [t] = useTranslation();
	const instanceActions = useGetRecurrentActions(event, { ...context, isInstance: true });
	const seriesActions = useGetRecurrentActions(event, { ...context, isInstance: false });

	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			{event.resource.iAmOrganizer && event.haveWriteAccess ? (
				<>
					{event.resource?.isRecurrent ? (
						<Padding right="small" style={{ display: 'flex' }}>
							<Dropdown
								data-testid={`series-options`}
								items={seriesActions}
								style={{ cursor: 'pointer' }}
							>
								<RecurrentRow padding={{ all: 'small' }}>
									<Padding right="small">
										<Text color={'primary'}>{t('label.series', 'SERIES')}</Text>
									</Padding>
									<Icon color={'primary'} icon="ArrowIosDownwardOutline" />
								</RecurrentRow>
							</Dropdown>
							{event.resource.calendar.id !== FOLDERS.TRASH && (
								<Padding left="small">
									<Dropdown
										data-testid={`instance-options`}
										items={instanceActions}
										style={{ cursor: 'pointer' }}
									>
										<RecurrentRow padding={{ all: 'small' }}>
											<Padding right="small">
												<Text color={'primary'}>{t('label.instance', 'INSTANCE')}</Text>
											</Padding>
											<Icon color={'primary'} icon="ArrowIosDownwardOutline" />
										</RecurrentRow>
									</Dropdown>
								</Padding>
							)}
						</Padding>
					) : (
						<OrganizerActions event={event} onClose={onClose} />
					)}
				</>
			) : (
				<ReplyButtonsPartSmall
					inviteId={event.resource?.inviteId}
					participationStatus={event.resource?.participationStatus}
					compNum={event.resource?.compNum}
					dispatch={dispatch}
					event={event}
				/>
			)}
		</Row>
	);
};
