/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import {
	Container,
	Divider,
	Dropdown,
	Icon,
	IconButton,
	Row,
	Text,
	useHiddenCount
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { map, some } from 'lodash';
import { useInvite } from '../../hooks/use-invite';
import { useEventPanelViewHeaderActions } from '../../hooks/use-event-panel-view-header-actions';
import { getAlarmToString } from '../../normalizations/normalizations-utils';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { RouteParams } from '../../types/route-params';
import { ExceptionReference } from '../../types/store/appointments';
import { AppointmentCardContainer } from '../editor/editor-panel-wrapper';
import { ParticipantsPart } from './participants-part';
import StyledDivider from '../../commons/styled-divider';
import { extractBody } from '../../commons/body-message-renderer';
import { selectCalendar } from '../../store/selectors/calendars';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';
import { DetailsPart } from './details-part';
import { ReplyButtonsPart } from './reply-buttons-part';
import { MessagePart } from './message-part';
import { ReminderPart } from './reminder-part';
import { AttachmentsBlock } from './attachments-part';

const BodyContainer = styled(Container)`
	overflow-y: auto;
	// TODO: personalize scrollbar

	//
	// // ::-webkit-scrollbar {
	// //   width: 12px;
	// // }
	//
	// /* Track */
	// // ::-webkit-scrollbar-track {
	// // 		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	// // 		-webkit-border-radius: 10px;
	// // 		border-radius: 10px;
	// // }
	//
	// /* Handle */
	// ::-webkit-scrollbar-thumb {
	// 		-webkit-border-radius: 10px;
	// 		border-radius: 10px;
	// 		background: rgba(255,0,0,0.8);
	// 		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
	// }
`;

const ActionButtons = ({ actions }: { actions: Array<any> }): ReactElement => {
	const actionContainerRef = useRef();
	const [hiddenActionsCount, recalculateHiddenActions] = useHiddenCount(actionContainerRef, true);

	useEffect(() => {
		recalculateHiddenActions();
	}, [actions, recalculateHiddenActions]);
	// todo: do we use it?
	return (
		<Row wrap="nowrap" height="100%" mainAlignment="flex-end" style={{ maxWidth: '160px' }}>
			<Row
				//	ref={actionContainerRef}
				height="40px"
				mainAlignment="flex-start"
				style={{ overflow: 'hidden' }}
			>
				{actions &&
					map(actions, (action) =>
						action.items ? (
							<Dropdown items={action.items} key={`button ${action.id}`}>
								<Row takeAvailableSpace>
									<IconButton icon="TagsMoreOutline" />
								</Row>
							</Dropdown>
						) : (
							<IconButton key={action.id} icon={action.icon} onClick={action.click} />
						)
					)}
			</Row>
			{/* IconButton disabled until the actions are active
			<Padding right="medium">
				<IconButton icon="MoreVertical" />
			</Padding>
			*/}
		</Row>
	);
};

const ExpandButton = ({ actions }: { actions: Array<any> }): ReactElement => (
	<Row height="40px" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
		{actions &&
			map(actions, (action) => (
				<IconButton key={action.id} icon={action.icon} onClick={action.click} />
			))}
	</Row>
);

export const DisplayerHeader = ({ event }: { event: any }): ReactElement => {
	const [t] = useTranslation();
	const actions = useEventPanelViewHeaderActions(event);

	const eventIsEditable = useMemo(() => some(actions, { id: EventActionsEnum.EDIT }), [actions]);
	const expandedButton = useMemo(() => some(actions, { id: EventActionsEnum.EXPAND }), [actions]);

	const close = useCallback(() => {
		replaceHistory('');
	}, []);

	return (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="48px"
				padding={{ vertical: 'small' }}
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={eventIsEditable ? 'NewAppointmentOutline' : 'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{event.title || t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				{expandedButton && <ExpandButton actions={actions} />}
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton size="medium" icon="CloseOutline" onClick={close} />
				</Row>
			</Row>
			<Divider />

			{eventIsEditable && (
				<Row
					mainAlignment="flex-end"
					crossAlignment="center"
					orientation="horizontal"
					background="gray5"
					width="fill"
					height="48px"
					padding={{ vertical: 'small' }}
				>
					<Row>
						<ActionButtons actions={actions} />
					</Row>
				</Row>
			)}
		</>
	);
};

export default function EventPanelView(): ReactElement | null {
	const { calendarId, apptId, ridZ } = useParams<RouteParams>();

	const calendar = useSelector(selectCalendar(calendarId));
	const appointment = useSelector(selectAppointment(apptId));
	const instance = useSelector(selectAppointmentInstance(apptId, ridZ));
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
			<DisplayerHeader event={event} />
			<Container
				padding={{ all: 'none' }}
				mainAlignment="flex-start"
				height="calc(100% - 48px)"
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
					{!event.resource.iAmOrganizer && !calendar?.owner && invite && (
						<>
							<ReplyButtonsPart
								inviteId={event.resource.inviteId}
								participationStatus={event.resource.participationStatus}
							/>
							<StyledDivider />
						</>
					)}
					{invite && (
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
