/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Container } from '@zextras/carbonio-design-system';
import React, { ComponentProps, ReactComponentElement, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Header } from './header';
import { DeleteEventModal } from '../delete/delete-event-modal';
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
import { useSearchActionsItems } from './hooks/use-search-actions-items';
import { useInvite } from './hooks/use-invite';

const BodyContainer = styled(Container)`
	overflow-y: auto;
	overflow-x: no-scroll;
`;

const Displayer = ({ event }: ComponentProps<any>): ReactComponentElement<any> => {
	const { close } = useSearchActionsFn(event);
	const invite = useInvite(event?.resource?.inviteId, event?.resource?.ridZ);
	const [deleteModal, setDeleteModal] = useState(false);
	const [isInstance, setIsInstance] = useState(false);

	const toggleDeleteModal = useCallback(
		(appt, value) => {
			if (appt) {
				setIsInstance(value);
			}
			if (deleteModal) {
				close();
			}
			setDeleteModal(!deleteModal);
		},
		[close, deleteModal]
	);

	const actions = useSearchActionsItems(event, toggleDeleteModal);

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
					{deleteModal && (
						<DeleteEventModal
							open={deleteModal}
							event={event}
							isInstance={isInstance}
							onClose={toggleDeleteModal}
						/>
					)}
				</>
			)}
		</Container>
	);
};

export default Displayer;
