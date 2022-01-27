/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '../event-panel-view/header';
import StyledDivider from '../../commons/styled-divider';
import ReminderPart from '../event-panel-view/reminder-part';
import MessagePart from '../event-panel-view/message-part';
import { extractBody } from '../../commons/body-message-renderer';
import ParticipantsPart from '../event-panel-view/participants-part';
import ReplyButtonsPart from '../event-panel-view/reply-buttons-part';
import DetailsPart from '../event-panel-view/details-part';
import ImageAndIconPart from '../event-panel-view/image-and-icon-part';
import { useQuickActions } from '../../hooks/use-quick-actions';
import { selectInstanceInvite } from '../../store/selectors/invites';
import AttachmentsPart from '../event-panel-view/attachments-part';

const BodyContainer = styled(Container)`
	overflow-y: auto;
	overflow-x: no-scroll;
`;

const EventPreviewPanel = ({ event }) => {
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const dispatch = useDispatch();

	const invite = useSelector((state) =>
		selectInstanceInvite(state, event?.resource?.inviteId, event?.resource?.ridZ)
	);

	const actions = useQuickActions(event, { replaceHistory, dispatch }, t);

	return (
		<>
			{event && <Header title={event.title} actions={actions} />}
			<ImageAndIconPart color={event?.resource?.calendar?.color?.color || 'primary'} />
			<BodyContainer
				orientation="vertical"
				mainAlignment="flex-start"
				width="fill"
				height="fit"
				padding={{ top: 'small' }}
			>
				<DetailsPart
					subject={event?.title}
					calendarColor={event?.resource?.calendar?.color?.color}
					location={event?.resource?.location}
					isPrivate={event?.resource.isPrivate}
					inviteNeverSent={event?.resource?.inviteNeverSent}
					event={event}
				/>
				<StyledDivider />
				{!event?.resource?.iAmOrganizer && !event?.resource?.owner && invite && (
					<>
						<ReplyButtonsPart
							inviteId={event?.resource?.inviteId}
							participationStatus={event?.resource?.participationStatus}
							compNum={invite?.compNum}
						/>
						<StyledDivider />
					</>
				)}
				{invite && (
					<ParticipantsPart
						iAmOrganizer={event?.resource?.iAmOrganizer}
						event={event}
						organizer={event?.resource?.organizer}
						participants={invite?.participants}
						inviteId={event?.resource.inviteId}
						compNum={invite?.compNum}
					/>
				)}
				{invite && extractBody(invite?.textDescription?.[0]?._content) && (
					<>
						<StyledDivider />
						<MessagePart
							fullInvite={invite}
							inviteId={event?.resource?.inviteId}
							parts={invite?.parts}
						/>
					</>
				)}
				<StyledDivider />
				{invite && (
					<ReminderPart
						editorId={event?.resource?.id}
						alarmString={invite?.alarmString}
						event={event}
					/>
				)}
				{invite?.attachmentFiles?.length > 0 && (
					<>
						<StyledDivider />
						<Container padding={{ all: 'medium' }}>
							<AttachmentsPart
								attachments={invite?.attachmentFiles}
								message={{ id: event?.resource?.inviteId, subject: event?.title }}
							/>
						</Container>
					</>
				)}
			</BodyContainer>
		</>
	);
};

export default EventPreviewPanel;
