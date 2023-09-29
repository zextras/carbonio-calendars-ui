/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Divider,
	Dropdown,
	Icon,
	IconButton,
	Row,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory } from '@zextras/carbonio-shell-ui';
import { filter, find, noop } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../../carbonio-ui-commons/types/folder';
import { extractBody } from '../../commons/body-message-renderer';
import StyledDivider from '../../commons/styled-divider';
import { PANEL_VIEW } from '../../constants';
import { useEventActions } from '../../hooks/use-event-actions';
import { useInvite } from '../../hooks/use-invite';
import { getAlarmToString } from '../../normalizations/normalizations-utils';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { useAppSelector } from '../../store/redux/hooks';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';
import { PanelView } from '../../types/actions';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { EventType } from '../../types/event';
import { RouteParams } from '../../types/route-params';
import { ExceptionReference } from '../../types/store/appointments';
import { AppointmentCardContainer } from '../editor/editor-panel-wrapper';
import { AttachmentsBlock } from './attachments-part';
import { DetailsPart } from './details-part';
import { MessagePart } from './message-part';
import { ParticipantsPart } from './participants-part';
import { ReminderPart } from './reminder-part';
import { ReplyButtonsPart } from './reply-buttons-part';

const BodyContainer = styled(Container)`
	overflow-y: auto;
`;

const ActionButtons = ({
	actions,
	event
}: {
	actions: Array<any>;
	event: EventType;
}): ReactElement | null => {
	const primaryAction = useMemo(() => {
		if (event) {
			if (event.resource.calendar.id === FOLDERS.TRASH) {
				return find(actions?.[0]?.items ?? actions, ['id', EventActionsEnum.MOVE]);
			}
			if (!event.resource.ridZ) {
				// SERIES ACTIONS
				const move = find(actions?.[1]?.items ?? actions, ['id', EventActionsEnum.MOVE]);
				const edit = find(actions?.[1]?.items ?? actions, ['id', EventActionsEnum.EDIT]);
				const copy = find(actions?.[1]?.items ?? actions, ['id', EventActionsEnum.CREATE_COPY]);
				if (!event.resource.iAmOrganizer && !event.isShared) {
					if (!edit.disabled) {
						return edit;
					}
					return move;
				}
				if (!edit.disabled) {
					return edit;
				}
				return copy;
			}
			// INSTANCE ACTIONS
			const move = find(actions?.[0]?.items ?? actions, ['id', EventActionsEnum.MOVE]);
			const edit = find(actions?.[0]?.items ?? actions, ['id', EventActionsEnum.EDIT]);
			const copy = find(actions?.[0]?.items ?? actions, ['id', EventActionsEnum.CREATE_COPY]);
			if (!event.resource.iAmOrganizer && !event.isShared) {
				if (!edit.disabled) {
					return edit;
				}
				return move ?? copy;
			}
			if (!edit.disabled) {
				return edit;
			}
			return copy;
		}
		return undefined;
	}, [actions, event]);

	const otherActions = useMemo(() => {
		if (event && primaryAction) {
			if (!event.resource.ridZ) {
				return filter(
					actions?.[1]?.items ?? actions,
					(a) =>
						!a.disabled &&
						a.id !== EventActionsEnum.EXPAND &&
						a.id !== EventActionsEnum.ACCEPT &&
						a.id !== EventActionsEnum.TENTATIVE &&
						a.id !== EventActionsEnum.DECLINE &&
						a.id !== primaryAction.id
				);
			}
			return filter(
				actions?.[0]?.items ?? actions,
				(a) =>
					!a.disabled &&
					a.id !== EventActionsEnum.EXPAND &&
					a.id !== EventActionsEnum.ACCEPT &&
					a.id !== EventActionsEnum.TENTATIVE &&
					a.id !== EventActionsEnum.DECLINE &&
					a.id !== primaryAction.id
			);
		}
		return undefined;
	}, [actions, event, primaryAction]);

	return primaryAction ? (
		<Row wrap="nowrap" height="100%" mainAlignment="flex-end" style={{ maxWidth: '10rem' }}>
			<Row height="2.5rem" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
				{primaryAction && primaryAction?.items ? (
					<Dropdown items={primaryAction.items} key={`button ${primaryAction.id}`}>
						<Row takeAvailableSpace>
							<Tooltip placement="top" label={primaryAction.label}>
								<IconButton icon="TagsMoreOutline" onClick={noop} />
							</Tooltip>
						</Row>
					</Dropdown>
				) : (
					<Tooltip placement="top" label={primaryAction.label}>
						<IconButton
							key={primaryAction.id}
							icon={primaryAction.icon}
							onClick={primaryAction.onClick}
						/>
					</Tooltip>
				)}
			</Row>
			{otherActions && otherActions?.length > 0 && (
				<>
					{otherActions.length > 1 ? (
						<Dropdown items={otherActions}>
							<Row takeAvailableSpace>
								<IconButton icon="MoreVertical" onClick={noop} />
							</Row>
						</Dropdown>
					) : (
						<Tooltip placement="top" label={otherActions?.[0]?.label}>
							<IconButton
								key={otherActions?.[0]?.id}
								icon={otherActions?.[0]?.icon}
								onClick={otherActions?.[0]?.onClick}
							/>
						</Tooltip>
					)}
				</>
			)}
		</Row>
	) : null;
};

export const DisplayerHeader = ({
	event,
	panelView
}: {
	event: EventType;
	panelView: PanelView;
}): ReactElement => {
	const [t] = useTranslation();
	const close = useCallback(() => {
		replaceHistory('');
	}, []);
	const actions = useEventActions({ onClose: close, event, context: { panelView } });

	return (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="3rem"
				padding={{ vertical: 'small' }}
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{event.title || t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton size="medium" icon="CloseOutline" onClick={close} />
				</Row>
			</Row>
			<Divider />
			<Row
				mainAlignment="flex-end"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="3rem"
				padding={{ vertical: 'small' }}
			>
				<Row>{actions && <ActionButtons actions={actions} event={event} />}</Row>
			</Row>
		</>
	);
};

export default function EventPanelView(): ReactElement | null {
	const { calendarId, apptId, ridZ } = useParams<RouteParams>();

	const calendar = useFolder(calendarId);
	const appointment = useAppSelector(selectAppointment(apptId));
	const instance = useAppSelector(selectAppointmentInstance(apptId, ridZ));
	const invite = useInvite((instance as ExceptionReference)?.inviteId ?? appointment?.inviteId);

	const event = useMemo(() => {
		if (calendar && appointment && invite)
			return normalizeCalendarEvent({ calendar, appointment, instance, invite });
		return undefined;
	}, [appointment, calendar, instance, invite]);

	const alarmString = useMemo(
		() => getAlarmToString(event?.resource?.alarmData),
		[event?.resource?.alarmData]
	);
	return event && invite ? (
		<AppointmentCardContainer mainAlignment="flex-start">
			<DisplayerHeader event={event} panelView={PANEL_VIEW.APP} />
			<Container
				padding={{ all: 'none' }}
				mainAlignment="flex-start"
				height="calc(100% - 3rem)"
				style={{ overflow: 'auto' }}
			>
				<BodyContainer
					orientation="vertical"
					mainAlignment="flex-start"
					width="fill"
					height="fill"
					padding={{ all: 'large' }}
					background="gray5"
				>
					<DetailsPart
						event={event}
						subject={event.title}
						isPrivate={event.resource.class === 'PRI' ?? false}
						inviteNeverSent={invite.neverSent}
						invite={invite}
					/>
					<StyledDivider />
					{!event.resource.iAmOrganizer && !(calendar as LinkFolder)?.owner && invite && (
						<>
							<ReplyButtonsPart
								inviteId={event.resource.inviteId}
								participationStatus={event.resource.participationStatus}
							/>
							<StyledDivider />
						</>
					)}
					{invite && invite.organizer && (
						<ParticipantsPart
							invite={invite}
							organizer={invite.organizer}
							participants={invite?.participants}
						/>
					)}
					{invite && extractBody(invite.textDescription?.[0]?._content) && (
						<>
							<StyledDivider />
							<MessagePart fullInvite={invite} inviteId={invite.id} parts={invite.parts} />
						</>
					)}
					<StyledDivider />
					{invite && <ReminderPart alarmString={alarmString} invite={invite} event={event} />}
					{invite?.attachmentFiles.length > 0 && (
						<>
							<StyledDivider />
							<Container padding={{ top: 'small', horizontal: 'large' }} background="gray6">
								<AttachmentsBlock
									attachments={invite?.attachmentFiles}
									id={invite.id}
									subject={event.title}
								/>
							</Container>
						</>
					)}
				</BodyContainer>
			</Container>
		</AppointmentCardContainer>
	) : null;
}
