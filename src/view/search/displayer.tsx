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
import { ReminderPart } from '../event-panel-view/reminder-part';
import { MessagePart } from '../event-panel-view/message-part';
import { extractBody } from '../../commons/body-message-renderer';
import { ParticipantsPart } from '../event-panel-view/participants-part';
import { ReplyButtonsPart } from '../event-panel-view/reply-buttons-part';
import { DetailsPart } from '../event-panel-view/details-part';
import { AttachmentsBlock } from '../event-panel-view/attachments-part';
import { useQuickActions } from '../../hooks/use-quick-actions';

const BodyContainer = styled(Container)`
	overflow-x: hidden;
	overflow-y: auto;
	white-space: pre-wrap;
	word-wrap: break-word !important;
	text-wrap: suppress !important;
`;

const Displayer = ({ event }: ComponentProps<any>): ReactComponentElement<any> => {
	const { close } = useSearchActionsFn(event);
	const invite = useInvite(event?.resource?.inviteId);

	const actions = useQuickActions(event, { isFromSearch: true });
	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ bottom: 'medium' }}
		>
			{event && (
				<Container padding={{ all: 'none' }} mainAlignment="flex-start">
					<Header title={event.title} actions={actions} closeAction={close} />
					<BodyContainer
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						width="fill"
						height="min(calc(100% - 50px), fit)"
						padding={{ all: 'large' }}
					>
						<DetailsPart
							subject={event?.title}
							isPrivate={event?.resource.isPrivate}
							inviteNeverSent={event?.resource?.inviteNeverSent}
							event={event}
							invite={invite}
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
								event={event}
								organizer={event?.resource?.organizer}
								participants={invite?.participants}
							/>
						)}
						{invite && extractBody(invite?.textDescription?.[0]?._content) && (
							<Container>
								<StyledDivider />
								<MessagePart
									fullInvite={invite}
									inviteId={event?.resource?.inviteId}
									parts={invite?.parts}
								/>
							</Container>
						)}

						<StyledDivider />
						{invite && <ReminderPart alarmString={invite?.alarmString} event={event} />}
						{invite?.attachmentFiles?.length > 0 && (
							<>
								<StyledDivider />
								<Container padding={{ all: 'medium' }} background="gray6">
									<AttachmentsBlock
										attachments={invite?.attachmentFiles}
										id={event?.resource?.inviteId}
										subject={event?.title}
									/>
								</Container>
							</>
						)}
					</BodyContainer>
				</Container>
			)}
		</Container>
	);
};

export default Displayer;
