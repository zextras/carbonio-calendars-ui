/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import React, { ComponentProps, ReactComponentElement } from 'react';
import styled from 'styled-components';
import { useInvite } from '../../hooks/use-invite';
import { Header } from './header';
import { useSearchActionsFn } from './hooks/use-search-actions-fn';
import StyledDivider from '../../commons/styled-divider';
import ReminderPart from '../event-panel-view/reminder-part';
import MessagePart from '../event-panel-view/message-part';
import { extractBody } from '../../commons/body-message-renderer';
import ParticipantsPart from '../event-panel-view/participants-part';
import ReplyButtonsPart from '../event-panel-view/reply-buttons-part';
import DetailsPart from '../event-panel-view/details-part';
import ImageAndIconPart from '../event-panel-view/image-and-icon-part';
import AttachmentsPart from '../event-panel-view/attachments-part';
import { useQuickActions } from '../../hooks/use-quick-actions';

const BodyContainer = styled(Container)`
	overflow-y: auto;
`;

const Displayer = ({ event }: ComponentProps<any>): ReactComponentElement<any> => {
	const { close } = useSearchActionsFn(event);
	const invite = useInvite(event?.resource?.inviteId);

	const actions = useQuickActions(event);

	return (
		<Container mainAlignment="flex-start">
			{event && (
				<>
					<Header title={event.title} actions={actions} closeAction={close} />
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
			)}
		</Container>
	);
};

export default Displayer;
