/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { Account, t, useUserAccount } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { Trans } from 'react-i18next';

import { InviteParticipant, InviteParticipants } from 'types/store/invite';
import { flattenInviteParticipants } from 'utils/attendees';

type ParticipantProps = { participant: InviteParticipants };

/**
 * Flat, unlabeled list of every invitee, with no indication of anyone's response status.
 * Used both for viewers with no stake in the event (e.g. someone just browsing an ICS/CalDAV
 * feed they aren't invited to) and for attendees/non-editors, who can't see other participants'
 * response status (see CO-4136).
 */
const SimplifiedParticipantsList = ({ participant }: ParticipantProps): ReactElement => {
	const users = flattenInviteParticipants(participant);
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			wrap="wrap"
			width="fill"
			padding={{ horizontal: 'medium', bottom: 'extrasmall' }}
		>
			{users.length > 2 ? (
				<>
					<Text size="small" color="secondary" overflow="break-word">
						<strong>
							{users[0].email} ,{users[1].email}{' '}
							<Trans
								i18nKey="participants.visitors"
								defaults="and other {{others}} attendees"
								values={{ others: users.length - 2 }}
							/>
						</strong>{' '}
						{t(`participants.Invited_Visitor`, 'have been invited')}
					</Text>
				</>
			) : (
				<>
					<Text size="small" color="secondary" overflow="break-word">
						<strong>
							{' '}
							{map(users, (user, index) => (
								<React.Fragment key={user.email || user.name}>
									{user.email || 'default'} {index === users.length - 1 ? null : <>,</>}
								</React.Fragment>
							))}
						</strong>{' '}
						{t(`participants.Invited_Visitor`, 'have been invited')}
					</Text>
				</>
			)}
		</Container>
	);
};

const calculateSize = (participants: InviteParticipants): number => {
	let pt = 0;
	Object.keys(participants).map((obj) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		participants[obj].map(() => {
			pt += 1;
			return 0;
		});
		return 0;
	});
	return pt;
};

type DisplayedParticipantType = {
	participant: InviteParticipant;
	message: string;
	loggedInUser: Account;
};

const DisplayedParticipant = ({
	participant,
	message,
	loggedInUser
}: DisplayedParticipantType): ReactElement => (
	<Container
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ bottom: 'extrasmall' }}
	>
		<Text overflow="ellipsis" size="small" color="secondary">
			{participant.name === loggedInUser.name || participant.email === loggedInUser.name ? (
				<strong> {t('message.you', 'You')}</strong>
			) : (
				<strong> {participant.name || participant.email} </strong>
			)}{' '}
			{message}
		</Text>
	</Container>
);
type ComponentProps = {
	label: ReactElement;
	participants?: Array<InviteParticipant>;
	width?: string;
	message: string;
	pt: number;
	loggedInUser: Account;
};

/**
 * Renders one response-status category (accepted/declined/tentative/no answer). Only ever
 * rendered for organizers/editors, who are allowed to see the full breakdown.
 */
const Component = ({
	label,
	participants = [],
	width,
	message,
	pt,
	loggedInUser
}: ComponentProps): ReactElement | null => {
	const displayedParticipants = useMemo(
		() => (
			<Container orientation="horizontal" crossAlignment="flex-start" wrap="wrap" width="fill">
				{participants.map((participant) => (
					<DisplayedParticipant
						participant={participant}
						key={participant.email}
						message={message}
						loggedInUser={loggedInUser}
					/>
				))}
			</Container>
		),
		[participants, loggedInUser, message]
	);
	return participants.length > 0 ? (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width={width}
			padding={{ horizontal: 'medium', bottom: 'extrasmall' }}
		>
			{pt > 2 ? (
				<Text size="small" color="secondary" overflow="break-word">
					{label}
				</Text>
			) : (
				displayedParticipants
			)}
		</Container>
	) : null;
};

type ParticipantsDisplayerSmallType = {
	participants?: InviteParticipants;
	canSeeResponseStatus: boolean;
};

export const ParticipantsDisplayerSmall = ({
	participants,
	canSeeResponseStatus
}: ParticipantsDisplayerSmallType): ReactElement | null => {
	const loggedInUser = useUserAccount();

	if (!participants || Object.keys(participants)?.length === 0) return null;

	// Response updates are only ever delivered to the organizer: a non-editor attendee can't
	// reliably know other participants' status, so they only get a flat, unlabeled list
	// instead (see CO-4136). Their own status is shown above the reply buttons instead.
	if (!canSeeResponseStatus) {
		return (
			<Container
				wrap="wrap"
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
				padding={{ horizontal: 'medium' }}
			>
				<SimplifiedParticipantsList participant={participants} />
			</Container>
		);
	}

	const pt = calculateSize(participants);
	return (
		<Container
			wrap="wrap"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			padding={{ horizontal: 'medium' }}
		>
			<Component
				label={
					<Trans
						i18nKey="participants.Attendees_accepted_count"
						count={participants.AC?.length ?? 0}
						values={{ count: participants.AC?.length ?? 0 }}
						defaults="<strong>{{count}} attendee </strong> has accepted"
					/>
				}
				message={t('participants.Accepted', 'accepted')}
				participants={participants.AC}
				pt={pt}
				loggedInUser={loggedInUser}
			/>

			<Component
				label={
					<Trans
						i18nKey="participants.Attendees_not_answered_count"
						count={participants.NE?.length ?? 0}
						values={{ count: participants.NE?.length ?? 0 }}
						defaults="<strong>1 attendee </strong> has not answered"
					/>
				}
				participants={participants.NE}
				message={t('participants.Not_answered', "didn't answer")}
				pt={pt}
				loggedInUser={loggedInUser}
			/>

			<Component
				label={
					<Trans
						i18nKey="participants.Attendees_tentative_count"
						count={participants.TE?.length ?? 0}
						values={{ count: participants.TE?.length ?? 0 }}
						defaults="<strong>1 attendee </strong> has accepted as tentative"
					/>
				}
				participants={participants.TE}
				message={t('participants.Tentative', 'accepted as tentative')}
				pt={pt}
				loggedInUser={loggedInUser}
			/>

			<Component
				label={
					<Trans
						i18nKey="participants.Attendees_declined_count"
						count={participants.DE?.length ?? 0}
						values={{ count: participants.DE?.length ?? 0 }}
						defaults="<strong>1 attendee </strong> has declined"
					/>
				}
				participants={participants.DE}
				message={t('participants.Declined', 'declined')}
				pt={pt}
				loggedInUser={loggedInUser}
			/>
		</Container>
	);
};
