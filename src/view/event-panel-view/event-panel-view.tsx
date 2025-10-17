/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import styled from '@emotion/styled';
import { Container, Divider, Icon, Row, Text, Button } from '@zextras/carbonio-design-system';
import { useHistoryNavigation, useFolder, LinkFolder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ActionButtons from './actions-buttons';
import { AttachmentsBlock } from './attachments-block';
import { DetailsPart } from './details-part';
import { MessagePart } from './message-part';
import { ParticipantsPart } from './participants-part';
import { ReminderPart } from './reminder-part';
import { ReplyButtonsPart } from './reply-buttons-part';
import { isAnInvite } from '../../actions/appointment-actions-items';
import StyledDivider from '../../commons/styled-divider';
import { CALENDAR_ROUTE, PANEL_VIEW } from '../../constants';
import { useEventActions } from '../../hooks/use-event-actions';
import { useInvite } from '../../hooks/use-invite';
import { getAlarmToString } from '../../normalizations/normalizations-utils';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { useAppSelector } from '../../store/redux/hooks';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';
import { PanelView } from '../../types/actions';
import { EventType } from '../../types/event';
import { RouteParams } from '../../types/route-params';
import { ExceptionReference } from '../../types/store/appointments';

const BodyContainer = styled(Container)`
	overflow-y: auto;
`;

const AppointmentCardContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 1rem;
	right: 1rem;
	bottom: 1rem;
	left: max(calc(100% - 42.5rem), 0.75rem);
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	padding: 0;
`;

export const DisplayerHeader = ({
	event,
	panelView
}: {
	event: EventType;
	panelView: PanelView;
}): ReactElement => {
	const { replaceHistory } = useHistoryNavigation();
	const [t] = useTranslation();
	const close = useCallback(() => {
		replaceHistory(`/${CALENDAR_ROUTE}`);
	}, [replaceHistory]);
	const actions = useEventActions({ onClose: close, event, context: { panelView } });

	return (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background={'gray5'}
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
					<Button type="ghost" color="text" size="medium" icon="CloseOutline" onClick={close} />
				</Row>
			</Row>
			<Divider />
			<Row
				mainAlignment="flex-end"
				crossAlignment="center"
				orientation="horizontal"
				background={'gray5'}
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
	const calendar = useFolder(calendarId ?? '');
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

	if (!event || !invite) {
		return null;
	}

	return (
		<AppointmentCardContainer mainAlignment="flex-start">
			<DisplayerHeader event={event} panelView={PANEL_VIEW.APP} />
			<Container
				padding={{ all: 0 }}
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
					background={'gray5'}
				>
					<DetailsPart
						event={event}
						subject={event.title}
						isPrivate={event.resource.class === 'PRI'}
						inviteNeverSent={invite.neverSent}
						invite={invite}
					/>
					<StyledDivider />
					{event.resource.organizer &&
						!event.resource.iAmOrganizer &&
						!(calendar as LinkFolder)?.owner &&
						isAnInvite(event) && (
							<>
								<ReplyButtonsPart event={event} invite={invite} />
								<StyledDivider />
							</>
						)}
					{invite.organizer && (
						<>
							<ParticipantsPart
								invite={invite}
								event={event}
								organizer={invite.organizer}
								participants={invite?.participants}
							/>
							<StyledDivider />
						</>
					)}

					<>
						<MessagePart fullInvite={invite} />
						<StyledDivider />
					</>

					{alarmString && (
						<>
							<ReminderPart alarmString={alarmString} invite={invite} event={event} />
							<StyledDivider />
						</>
					)}
					{invite?.attachmentFiles.length > 0 && (
						<>
							<Container padding={{ top: 'small', horizontal: 'large' }} background={'gray6'}>
								<AttachmentsBlock
									attachments={invite?.attachmentFiles}
									id={invite.id}
									subject={event.title}
								/>
							</Container>
							<StyledDivider />
						</>
					)}
				</BodyContainer>
			</Container>
		</AppointmentCardContainer>
	);
}
