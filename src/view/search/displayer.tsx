/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	ModalManagerContext,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import React, { ComponentProps, ReactComponentElement, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useInvite } from '../../hooks/use-invite';
import { createAndApplyTag } from '../tags/tag-actions';
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
`;

const Displayer = ({ event }: ComponentProps<any>): ReactComponentElement<any> | null => {
	const { close } = useSearchActionsFn(event);
	const invite = useInvite(event?.resource?.inviteId);
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);

	const context = useMemo(
		() => ({
			replaceHistory,
			dispatch,
			createModal,
			createSnackbar,
			searchPanel: true,
			panel: false,
			tags,
			createAndApplyTag,
			isInstance: true,
			isFromSearch: true
		}),
		[createModal, createSnackbar, dispatch, tags]
	);

	const actions = useQuickActions(invite, event, context);
	return invite ? (
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
							event={event}
							subject={event?.title}
							isPrivate={event?.resource.isPrivate}
							inviteNeverSent={event?.resource?.inviteNeverSent}
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
								invite={invite}
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
						{invite && <ReminderPart alarmString={invite?.alarmString} invite={invite} />}
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
	) : null;
};

export default Displayer;
