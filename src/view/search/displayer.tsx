/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentProps, ReactComponentElement } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { extractBody } from '../../commons/body-message-renderer';
import StyledDivider from '../../commons/styled-divider';
import { PANEL_VIEW } from '../../constants';
import { useInvite } from '../../hooks/use-invite';
import { AttachmentsBlock } from '../event-panel-view/attachments-block';
import { DetailsPart } from '../event-panel-view/details-part';
import { DisplayerHeader } from '../event-panel-view/event-panel-view';
import { MessagePart } from '../event-panel-view/message-part';
import { ParticipantsPart } from '../event-panel-view/participants-part';
import { ReminderPart } from '../event-panel-view/reminder-part';
import { ReplyButtonsPart } from '../event-panel-view/reply-buttons-part';

const BodyContainer = styled(Container)`
	overflow-x: hidden;
	overflow-y: auto;
	white-space: pre-wrap;
	word-wrap: break-word !important;
`;

const Displayer = ({ event }: ComponentProps<any>): ReactComponentElement<any> | null => {
	const invite = useInvite(event?.resource?.inviteId);
	return invite ? (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ bottom: 'medium' }}
		>
			{event && (
				<Container padding={{ all: 'none' }} mainAlignment="flex-start">
					<DisplayerHeader event={event} panelView={PANEL_VIEW.SEARCH} />
					<BodyContainer
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						width="fill"
						height="min(calc(100% - 3.125rem), fit)"
						padding={{ all: 'large' }}
					>
						<DetailsPart
							event={event}
							subject={event?.title}
							isPrivate={event?.resource.isPrivate}
							inviteNeverSent={event?.resource?.inviteNeverSent}
							invite={invite}
						/>
						<StyledDivider />
						{event.resource.organizer &&
							!event?.resource?.iAmOrganizer &&
							!event?.resource?.owner &&
							invite && (
								<>
									<ReplyButtonsPart invite={invite} event={event} />
									<StyledDivider />
								</>
							)}
						{invite && event && invite.organizer && (
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
						{invite && extractBody(invite?.textDescription?.[0]?._content) && (
							<Container>
								<MessagePart
									fullInvite={invite}
									inviteId={event?.resource?.inviteId}
									parts={invite?.parts}
								/>
								<StyledDivider />
							</Container>
						)}
						{invite && invite?.alarmString && (
							<>
								<ReminderPart alarmString={invite?.alarmString} invite={invite} event={event} />
								<StyledDivider />
							</>
						)}
						{invite?.attachmentFiles?.length > 0 && (
							<>
								<Container padding={{ all: 'medium' }} background="gray6">
									<AttachmentsBlock
										attachments={invite?.attachmentFiles}
										id={event?.resource?.inviteId}
										subject={event?.title}
									/>
								</Container>
								<StyledDivider />
							</>
						)}
					</BodyContainer>
				</Container>
			)}
		</Container>
	) : null;
};

export default Displayer;
