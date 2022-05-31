/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/*
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
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { extractBody } from '../../commons/body-message-renderer';
import { selectCalendar } from '../../store/selectors/calendars';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { Store } from '../../types/store/store';
import ParticipantsPart from './participants-part';
import MessagePart from './message-part';
import DetailsPart from './details-part';
import AttachmentsPart from './attachments-part';
import ReplyButtonsPart from './reply-buttons-part';
import StyledDivider from '../../commons/styled-divider';
import ReminderPart from './reminder-part';

const ActionButtons = ({ actions, closeAction }) => {
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
							<Dropdown items={action.items}>
								<Row takeAvailableSpace>
									<IconButton icon="TagsMoreOutline" />
								</Row>
							</Dropdown>
						) : (
							<IconButton key={action.id} icon={action.icon} onClick={action.click} />
						)
					)}
			</Row>
			{/!* IconButton disabled until the actions are active
			<Padding right="medium">
				<IconButton icon="MoreVertical" />
			</Padding>
			*!/}
		</Row>
	);
};

const DisplayerHeader = ({ title, actions }) => {
	const [t] = useTranslation();
	const eventIsEditable = some(actions, { id: 'edit' });
	const expandedButton = some(actions, { id: 'expand' });

	const close = useCallback(() => {
		replaceHistory(``);
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
						{title || t('label.no_subject', 'No subject')}
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
						<ActionButtons actions={actions} closeAction={close} />
					</Row>
				</Row>
			)}
		</>
	);
};

const BodyContainer = styled(Container)`
	overflow-y: auto;
	overflow-x: no-scroll;
	// TODO: personalize scrollbar

	//
	// // ::-webkit-scrollbar {
	// //   width: 12px;
	// // }
	//
	// /!* Track *!/
	// // ::-webkit-scrollbar-track {
	// // 		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	// // 		-webkit-border-radius: 10px;
	// // 		border-radius: 10px;
	// // }
	//
	// /!* Handle *!/
	// ::-webkit-scrollbar-thumb {
	// 		-webkit-border-radius: 10px;
	// 		border-radius: 10px;
	// 		background: rgba(255,0,0,0.8);
	// 		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
	// }
`;

const AppointmentCardContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 68px;
	right: 12px;
	bottom: 12px;
	left: ${'max(calc(100% - 680px), 12px)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
`;

type EventPreviewUIProps = {
	title: string;
	location: string;
};

export const PreviewUI = ({
	event,
	invite,
	actions
}: {
	event: EventType;
	invite: Invite;
	actions: any;
}): JSX.Element => {
	const { calendarId } = useParams<{ calendarId: string }>();
	const calendar = useSelector((s: Store) => selectCalendar(s, calendarId));
	return (
		<AppointmentCardContainer background="gray5" mainAlignment="flex-start">
			<DisplayerHeader title={event.title} actions={actions} />
			<Container padding={{ all: 'none' }} mainAlignment="flex-start" height="calc(100% - 64px)">
				<BodyContainer
					orientation="vertical"
					mainAlignment="flex-start"
					width="fill"
					height="fit"
					padding={{ all: 'large' }}
					background="gray5"
				>
					<DetailsPart
						subject={event.title}
						calendarColor={calendar.color.color}
						location={event.resource.location}
						isPrivate={event.resource.isPrivate}
						inviteNeverSent={event.resource.inviteNeverSent}
						event={event}
						invite={invite}
					/>
					<StyledDivider />
					{!event.resource.iAmOrganizer && !event.resource.owner && invite && (
						<>
							<ReplyButtonsPart
								inviteId={event.resource.inviteId}
								participationStatus={event.resource.participationStatus}
								compNum={invite.compNum}
							/>
							<StyledDivider />
						</>
					)}
					{invite && (
						<ParticipantsPart
							iAmOrganizer={event.resource.iAmOrganizer}
							event={event}
							organizer={event.resource.organizer}
							participants={invite?.participants}
							inviteId={event.resource.inviteId}
							compNum={invite.compNum}
						/>
					)}
					{invite && extractBody(invite.textDescription?.[0]?._content) && (
						<>
							<StyledDivider />
							<MessagePart
								fullInvite={invite}
								inviteId={event.resource.inviteId}
								parts={invite.parts}
							/>
						</>
					)}
					<StyledDivider />
					{invite && (
						<ReminderPart
							editorId={event.resource.id}
							alarmString={invite.alarmString}
							event={event}
						/>
					)}
					{invite?.attachmentFiles.length > 0 && (
						<>
							<StyledDivider />
							<Container padding={{ top: 'small', horizontal: 'large' }} background="gray6">
								<AttachmentsPart
									attachments={invite?.attachmentFiles}
									message={{ id: event.resource.inviteId, subject: event.title }}
								/>
							</Container>
						</>
					)}
					<Container background="gray6" height="32px" />
				</BodyContainer>
			</Container>
		</AppointmentCardContainer>
	);
};
*/
