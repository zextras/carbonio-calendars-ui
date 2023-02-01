/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	Dropdown,
	Icon,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map, noop, toUpper } from 'lodash';
import React, { ReactElement, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { EventType } from '../types/event';
import { ParticipationStatus } from '../types/store/invite';

type ResponseProp = {
	id: string;
	icon: string;
	label: string;
	value: ParticipationStatus;
	action?: () => void;
	color: string;
	selected?: boolean;
	customComponent?: ReactElement;
};

type ReplyButtonProps = {
	inviteId: string;
	compNum: number;
	event: EventType;
	actions: any;
	participationStatus: ParticipationStatus;
};

export const ReplyButtonsPartSmall = ({
	participationStatus,
	inviteId,
	actions
}: ReplyButtonProps): ReactElement => {
	const dispatch = useDispatch();

	const replyAction = useCallback(
		(action) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: true,
					action
				})
			);
		},
		[dispatch, inviteId]
	);

	const attendeesOptions: Array<ResponseProp> = useMemo(
		() => [
			{
				id: 'option_2',
				icon: 'CheckmarkCircle2',
				label: toUpper(t('event.action.yes', 'Yes')),
				value: 'AC',
				action: () => replyAction('ACCEPT'),
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
				action: () => replyAction('TENTATIVE'),
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
				value: 'NE',
				action: () => replyAction('DECLINE'),
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
		],
		[replyAction]
	);

	const attendingResponse = useCallback((value: ParticipationStatus): ResponseProp => {
		switch (value) {
			case 'TE':
				return {
					id: 'option_3',
					icon: 'QuestionMarkCircle',
					label: toUpper(t('label.tentative', 'Tentative')),
					value: 'TE',
					color: 'warning',
					selected: false
				};
			case 'AC':
				return {
					id: 'option_2',
					icon: 'CheckmarkCircle2',
					label: toUpper(t('event.action.yes', 'Yes')),
					value: 'AC',
					color: 'success',
					selected: false
				};

			case 'DE':
				return {
					id: 'option_1',
					icon: 'CloseCircle',
					label: toUpper(t('event.action.no', 'No')),
					value: 'DE',
					color: 'error'
				};
			case 'NE':
				return {
					id: 'option_4',
					icon: 'CalendarWarning',
					label: toUpper(t('event.action.needs_action', 'Needs action')),
					value: 'NE',
					color: 'primary'
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
	}, []);

	const defaultValue = useMemo(
		() => attendingResponse(participationStatus),
		[attendingResponse, participationStatus]
	);
	const [invtReply, setInvtReply] = useState(defaultValue);

	const attendeesResponseOptions = useMemo(
		() =>
			map(attendeesOptions, (option) => ({
				id: option.label,
				icon: option.icon,
				label: option.label,
				value: option.value,
				key: option.id,
				color: option.color,
				customComponent: option.customComponent,
				click: (ev: SyntheticEvent<HTMLElement> | KeyboardEvent): void => {
					ev.stopPropagation();
					if (option.action) {
						option.action();
					}
					setInvtReply(option);
				}
			})),
		[attendeesOptions]
	);
	return (
		<Container orientation="horizontal" mainAlignment="flex-end">
			<Dropdown items={attendeesResponseOptions} placement="bottom-end">
				<Button
					type="outlined"
					label={invtReply.label}
					icon="ChevronDown"
					onClick={noop}
					color={invtReply.color}
				/>
			</Dropdown>
			<Padding left="small">
				<Dropdown disableAutoFocus items={actions} placement="bottom-end">
					<Button
						type="outlined"
						label={t('label.other_actions', 'Other actions')}
						icon="ChevronDown"
						onClick={noop}
					/>
				</Dropdown>
			</Padding>
		</Container>
	);
};
