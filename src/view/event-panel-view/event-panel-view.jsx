/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext } from 'react';
import styled from 'styled-components';
import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useDispatch, useSelector } from 'react-redux';
import ParticipantsPart from './participants-part';
import MessagePart from './message-part';
import DetailsPart from './details-part';
import AttachmentsPart from './attachments-part';
import ReplyButtonsPart from './reply-buttons-part';
import StyledDivider from '../../commons/styled-divider';
import { extractBody } from '../../commons/body-message-renderer';
import Panel from '../../commons/panel';
import { useQuickActions } from '../../hooks/use-quick-actions';
import { EventContext } from '../../commons/event-context';
import ReminderPart from './reminder-part';
import { selectInstanceInvite } from '../../store/selectors/invites';

const BodyContainer = styled(Container)`
	overflow-y: auto;
	overflow-x: no-scroll;
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

export default function EventPanelView({ event, close }) {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const utils = useContext(EventContext);
	const invite = useSelector((state) =>
		selectInstanceInvite(state, event.resource.inviteId, event.resource.ridZ)
	);
	const actions = useQuickActions(event, { utils, replaceHistory, dispatch }, t);

	return (
		<Panel closeAction={close} actions={actions} resizable={false} title={event.title}>
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
						calendarColor={event.resource.calendar.color.color}
						location={event.resource.location}
						isPrivate={event.resource.isPrivate}
						inviteNeverSent={event.resource.inviteNeverSent}
						event={event}
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
							participants={invite.participants}
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
		</Panel>
	);
}
