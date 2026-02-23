/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo } from 'react';

import styled from '@emotion/styled';
import { Container, Row, Icon, Divider, Spinner } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { ROOT_NAME, FOLDERS, getRootAccountId, useRoot } from '@zextras/carbonio-ui-commons';
import { filter, includes } from 'lodash';
import moment from 'moment';

import 'moment-timezone';
import { AvailabilityChecker } from './parts/availability-checker';
import { EventDetails } from './parts/event-details';
import InviteHeaderPart from './parts/invite-header-part';
import InviteReplyPart from './parts/invite-reply-part';
import { ParticipantsList } from './parts/participants-list';
import ProposedTimeReply from './parts/proposed-time-reply';
import { useFetchInvite } from './useFetchInvite';
import { BodyMessageRenderer } from '../../commons/body-message-renderer';
import { MESSAGE_METHOD } from '../../constants/api';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { StoreProvider } from '../../store/redux';
import type { InviteResponseArguments } from '../../types/integrations';

const InviteContainer = styled(Container)`
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	border-radius: 0.875rem;
	margin: ${({ theme }): string => theme.sizes.padding.extrasmall};
	padding: ${({ theme }): string => theme.sizes.padding.extralarge};
`;

export const InviteResponse: FC<InviteResponseArguments> = ({
	mailMsg,
	moveToTrash
}): ReactElement => {
	const account = useUserAccount();

	const method = mailMsg.invite[0]?.comp[0].method;
	const { invite: fetchedInv, loading: fetchingInvite } = useFetchInvite(mailMsg, false);
	const rootAccountId = getRootAccountId(mailMsg.parent) ?? FOLDERS.USER_ROOT;
	const root = useRoot(rootAccountId);
	const invite = normalizeInvite({ ...mailMsg, inv: fetchedInv });

	const email = useMemo(
		() => (root?.name === ROOT_NAME ? account.name : (root?.name ?? account.name)),
		[account.name, root?.name]
	);

	const isAttendee = useMemo(
		() => invite?.organizer?.a !== account.name,
		[account.name, invite?.organizer?.a]
	);

	// When replying/declining, participants marked as 'f' (from) in the original
	// message must be treated as 't' (to) recipients in the outgoing response.
	const to = useMemo(
		() =>
			filter(
				mailMsg.participants as [{ address: string; fullName: string; name: string; type: string }],
				{ type: 'f' }
			).map((participant) => ({ ...participant, type: 't' })),
		[mailMsg?.participants]
	);

	const getEndOfDay = (day: string | number): number => moment(day).endOf('day').valueOf();

	const proposedStartTime = mailMsg.invite[0]?.comp?.[0]?.s?.[0]?.d;
	const proposedEndTime = mailMsg.invite[0]?.comp?.[0]?.e?.[0]?.d;

	const inviteId =
		invite.apptId && !includes(invite.id, ':') ? `${invite.apptId}-${invite.id}` : invite.id;

	if (fetchingInvite) {
		return (
			<InviteContainer data-testid={'invite-response'}>
				<Container padding={{ horizontal: 'small', vertical: 'large' }} width="100%">
					<Spinner color={'primary'} />
				</Container>
			</InviteContainer>
		);
	}

	return (
		<InviteContainer data-testid={'invite-response'}>
			<Container padding={{ horizontal: 'small', vertical: 'large' }} width="100%">
				<InviteHeaderPart
					invite={invite}
					mailMsg={mailMsg}
					method={method}
					proposedStartTime={proposedStartTime}
					proposedEndTime={proposedEndTime}
				/>
				{method === MESSAGE_METHOD.REQUEST && root && (
					<AvailabilityChecker
						email={email}
						rootId={root.id}
						start={invite?.start?.u ?? moment(proposedStartTime).valueOf()}
						end={invite?.end?.u ?? getEndOfDay(proposedEndTime)}
						allDay={invite.allDay ?? false}
						uid={invite.uid}
					/>
				)}
				{method === MESSAGE_METHOD.COUNTER && mailMsg.parent !== FOLDERS.SENT && (
					<ProposedTimeReply
						id={invite?.apptId}
						start={
							proposedStartTime ? moment(proposedStartTime).valueOf() : (invite?.start?.u ?? 0)
						}
						end={proposedEndTime ? moment(proposedEndTime).valueOf() : (invite?.end?.u ?? 0)}
						moveToTrash={moveToTrash}
						title={mailMsg.subject}
						to={to}
						msg={mailMsg}
						fragment={invite?.fragment}
					/>
				)}
				{method !== MESSAGE_METHOD.COUNTER && isAttendee && (
					<InviteReplyPart inviteId={inviteId} message={mailMsg} />
				)}
				<EventDetails invite={invite} />
				<Row
					width="100%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ vertical: 'medium' }}
				>
					{/* Required Participants List */}
					<ParticipantsList
						organizer={invite?.organizer}
						attendees={invite.attendees}
						isReqParticipantList
					/>
					{/* Optional Participants List */}
					<ParticipantsList attendees={invite.attendees} />
				</Row>
				{invite && (
					<Row
						width="100%"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ bottom: 'large' }}
					>
						<Row width="100%" padding={{ vertical: 'medium' }}>
							<Divider />
						</Row>
						<Row padding={{ right: 'small' }}>
							<Icon size="large" icon="MessageSquareOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<BodyMessageRenderer
								htmlDescription={invite.htmlDescription}
								textDescription={invite.textDescription}
							/>
						</Row>
					</Row>
				)}
			</Container>
		</InviteContainer>
	);
};

export const InviteResponseComp: FC<InviteResponseArguments> = (props) => (
	<StoreProvider>
		<InviteResponse {...props} />
	</StoreProvider>
);
