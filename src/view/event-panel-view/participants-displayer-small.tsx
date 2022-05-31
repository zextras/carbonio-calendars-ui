/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation, Trans } from 'react-i18next';
import React, { useMemo } from 'react';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { EventType } from '../../types/event';
import { InviteParticipant, InviteParticipants } from '../../types/store/invite';

type DropdownProps = {
	label: JSX.Element;
	participants: [];
	message: string;
	event: EventType;
	pt: number;
};

const calculateSize = (participants): number => {
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

const DisplayedParticipant = ({ participant, message }: { message: string }): JSX.Element => {
	const [t] = useTranslation();
	const account = useUserAccount();

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			takeAvailableSpace
			padding={{ bottom: 'extrasmall' }}
		>
			<Text overflow="ellipsis" size="small" color="secondary">
				{participant.name === account.name || participant.email === account.name ? (
					<strong> {t('message.you', 'You')}</strong>
				) : (
					<strong> {participant.name || participant.email} </strong>
				)}{' '}
				{message}
			</Text>
		</Container>
	);
};

const DisplayParticipantsVisitor = ({ participant }) => {
	const [t] = useTranslation();
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

const DisplayMultipleAttendee = ({
	participant,
	message
}: {
	participant: Array<InviteParticipant>;
	message: string;
}): JSX.Element => {
	const [t] = useTranslation();
	const account = useUserAccount();

	return (
		<Row>
			<Text size="small" color="secondary" overflow="break-word">
				<strong>
					{' '}
					{map(participant, (user, index) => (
						<React.Fragment key={user.name || user.email}>
							{user.name === account.name || user.email === account.name ? (
								<> {t('message.you', 'You')}</>
							) : (
								<> {user.name || user.email} </>
							)}
							{index === participant.length - 1 && <>,</>}
						</React.Fragment>
					))}
				</strong>{' '}
				{message}
			</Text>
		</Row>
	);
};

const Dropdown = ({ label, participants = [], message, event, pt }: DropdownProps): JSX.Element => {
	const displayedParticipants = useMemo(
		() => (
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				wrap="wrap"
				takeAvailableSpace
				width="fill"
			>
				{participants.map((participant, index) => (
					<DisplayedParticipant
						participant={participant}
						key={`participant-${index}`}
						message={message}
					/>
				))}
			</Container>
		),
		[participants, message]
	);
	return (
		<>
			{participants.length > 0 && (
				<Container
					orientation="vertical"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
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
								<DisplayMultipleAttendee participant={participants} message={message} />
							) : (
								displayedParticipants
							)}{' '}
						</>
					)}
				</Container>
			)}
		</>
	);
};

export const ParticipantsDisplayer = ({
	participants,
	event
}: {
	participants: InviteParticipants;
	event: EventType;
}): JSX.Element | null => {
	const [t] = useTranslation();
	const pt = calculateSize(participants);
	if (Object.keys(participants).length === 0) return null;
	return (
		<Container
			wrap="wrap"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			padding={{ horizontal: 'medium', top: 'extrasmall' }}
			takeAvailableSpace
		>
			{!event?.resource?.iAmOrganizer && event?.resource?.calendar?.owner ? (
				<DisplayParticipantsVisitor participant={participants} />
			) : (
				<>
					<Dropdown
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
					/>
					<Dropdown
						label={
							<Trans
								i18nKey="participants.Attendees_not_answered_count"
								count={participants.NE?.length ?? 0}
								values={{ count: participants.NE?.length ?? 0 }}
								defaults="<strong>{{count}} attendee </strong> has not answered"
							/>
						}
						participants={participants.NE}
						message={t('participants.Not_answered', "didn't answer")}
						event={event}
						pt={pt}
					/>
					<Dropdown
						label={
							<Trans
								i18nKey="participants.Attendees_tentative_count"
								count={participants.TE?.length ?? 0}
								values={{ count: participants.TE?.length ?? 0 }}
								defaults="<strong>{{count}} attendee </strong> has accepted as tentative"
							/>
						}
						participants={participants.TE}
						message={t('participants.Tentative', 'accepted as tentative')}
						event={event}
						pt={pt}
					/>
					<Dropdown
						label={
							<Trans
								i18nKey="participants.Attendees_declined_count"
								count={participants.DE?.length ?? 0}
								values={{ count: participants.DE?.length ?? 0 }}
								defaults="<strong>{{count}} attendee </strong> has declined"
							/>
						}
						participants={participants.DE}
						message={t('participants.Declined', 'declined')}
						event={event}
						pt={pt}
					/>
				</>
			)}
		</Container>
	);
};
