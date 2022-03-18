/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { Avatar, Container, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

const DisplayParticipantsVisitor = ({ participant, t }) => {
	const users = [];
	map(Object.keys(participant), (status) => map(participant[status], (user) => users.push(user)));
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			wrap="wrap"
			takeAvailableSpace
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

const DisplayMultipleAttendee = ({ participant, message, t, loggedInUser }) => (
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

const calculateSize = (participants) => {
	let pt = 0;
	Object.keys(participants).map((obj) => {
		participants[obj].map(() => {
			pt += 1;
			return 0;
		});
		return 0;
	});
	return pt;
};

const DisplayedParticipant = ({ participant, message, loggedInUser }) => {
	const [t] = useTranslation();

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			takeAvailableSpace
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
};

const Component = ({ label, participants = [], width, message, event, pt, loggedInUser, t }) => {
	const displayedParticipants = useMemo(
		() => (
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				wrap="wrap"
				takeAvailableSpace
				width="fill"
			>
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
	return (
		participants.length > 0 && (
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
								t={t}
								loggedInUser={loggedInUser}
							/>
						) : (
							displayedParticipants
						)}{' '}
					</>
				)}
			</Container>
		)
	);
};

const ParticipantsDisplayerSmall = ({ participants = [], event }) => {
	const [t] = useTranslation();
	const pt = calculateSize(participants);
	const loggedInUser = useUserAccounts()[0];
	if (Object.keys(participants).length === 0) return null;
	return (
		<Container
			wrap="wrap"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			padding={{ horizontal: 'medium' }}
			takeAvailableSpace
		>
			{!event?.resource?.iAmOrganizer && event?.resource?.calendar?.owner ? (
				<DisplayParticipantsVisitor participant={participants} t={t} event={event} />
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
						t={t}
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
						t={t}
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
						t={t}
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
						t={t}
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

const ParticipantsPartSmall = ({ event, organizer, participants }) => {
	const [t] = useTranslation();
	const accounts = useUserAccounts();

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ top: 'small' }}
		>
			{event?.resource?.iAmOrganizer && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Padding right="small">
						<Avatar size="small" label={accounts[0].name || accounts[0].displayName} />
					</Padding>

					<Text overflow="break-word" weight="bold">
						{t('message.you', 'You')}&nbsp;
					</Text>
					<Text overflow="break-word"> {t('message.are_organizer', 'are the organizer')}</Text>
				</Row>
			)}
			{event?.resource?.iAmAttendee && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Padding right="small">
						<Avatar size="small" label={organizer.name || organizer.email} />
					</Padding>
					<Text>
						<Trans
							i18nKey="message.somebody_invited_you"
							defaults="<strong>{{somebody}}</strong> invited you"
							values={{ somebody: organizer.name || organizer.email }}
						/>
					</Text>
				</Row>
			)}
			{event?.resource?.iAmVisitor && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Padding right="small">
						<Avatar size="small" label={organizer.name || organizer.email} />
					</Padding>

					<Text>
						<Trans
							i18nKey="message.somebody_is_organizer"
							defaults="<strong>{{somebody}}</strong> is the organizer"
							values={{ somebody: organizer.name || organizer.email }}
						/>
					</Text>
				</Row>
			)}
			<ParticipantsDisplayerSmall participants={participants} event={event} />
		</Container>
	);
};

export const ParticipantsRow = ({ event, invite }) => (
	<>
		{invite &&
		event?.resource?.class === 'PRI' &&
		event?.resource?.calendar?.owner &&
		!event?.resource?.iAmOrganizer ? null : (
			<ParticipantsPartSmall
				iAmOrganizer={event?.resource?.iAmOrganizer}
				event={event}
				organizer={event?.resource?.organizer}
				participants={invite?.participants}
				inviteId={event?.resource?.inviteId}
				compNum={invite?.compNum}
			/>
		)}
	</>
);
