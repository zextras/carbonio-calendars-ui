/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Container, Row, Text } from '@zextras/carbonio-design-system';
import { Account, t, useUserAccount } from '@zextras/carbonio-shell-ui';
import { map, reduce } from 'lodash';
import { Trans } from 'react-i18next';

import { EventType } from '../../types/event';
import { InviteParticipant, InviteParticipants } from '../../types/store/invite';

type ParticipantProps = { participant: InviteParticipants; event: EventType };

const DisplayParticipantsVisitor = ({ participant }: ParticipantProps): ReactElement => {
	const users = reduce(
		participant,
		(acc, v) => (v ? [...acc, ...v] : acc),
		[] as Array<InviteParticipant>
	);
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

type DisplayMultipleAttendee = {
	participant: Array<InviteParticipant>;
	message: string;
	loggedInUser: Account;
};

const DisplayMultipleAttendee = ({
	participant,
	message,
	loggedInUser
}: DisplayMultipleAttendee): ReactElement => (
	<Row>
		<Text size="small" color="secondary" overflow="break-word">
			<strong>
				{' '}
				{map(participant, (user, index) => (
					<React.Fragment key={user.name || user.email}>
						{user.name === loggedInUser.name || user.email === loggedInUser.name ? (
							<> {t('message.you', 'You')}</>
						) : (
							<> {user.name || user.email} </>
						)}
						{index === participant.length - 1 ? null : <>,</>}
					</React.Fragment>
				))}
			</strong>{' '}
			{message}
		</Text>
	</Row>
);

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
	event: EventType;
	pt: number;
	loggedInUser: Account;
};

const Component = ({
	label,
	participants = [],
	width,
	message,
	event,
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
			{event?.resource?.iAmOrganizer && (
				<>
					{pt > 2 ? (
						<Text size="small" color="secondary" overflow="break-word">
							{label}
						</Text>
					) : (
						displayedParticipants
					)}
				</>
			)}

			{!event?.resource?.iAmOrganizer && !event?.resource?.calendar?.owner && (
				<>
					{' '}
					{pt > 2 ? (
						<DisplayMultipleAttendee
							participant={participants}
							message={message}
							loggedInUser={loggedInUser}
						/>
					) : (
						displayedParticipants
					)}{' '}
				</>
			)}
		</Container>
	) : null;
};

type ParticipantsDisplayerSmallType = {
	event: EventType;
	participants?: InviteParticipants;
};

export const ParticipantsDisplayerSmall = ({
	participants,
	event
}: ParticipantsDisplayerSmallType): ReactElement | null => {
	const loggedInUser = useUserAccount();

	if (!participants || Object.keys(participants)?.length === 0) return null;
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
			{event?.resource?.iAmOrganizer && !event?.resource?.calendar?.owner ? (
				<DisplayParticipantsVisitor participant={participants} event={event} />
			) : (
				<>
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
						event={event}
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
						event={event}
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
						event={event}
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
						event={event}
						pt={pt}
						loggedInUser={loggedInUser}
					/>
				</>
			)}
		</Container>
	);
};
