/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Avatar, Container, Row, Text, Padding } from '@zextras/carbonio-design-system';
import { useTranslation, Trans } from 'react-i18next';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { EventType } from '../../types/event';
import { InviteParticipants } from '../../types/store/invite';
import { ParticipantsDisplayer } from './participants-displayer-small';

type ParticipantsProps = {
	event: EventType;
	organizer: {
		name: string;
		email: string;
	};
	participants: InviteParticipants;
};

export const ParticipantsPart = ({
	event,
	organizer,
	participants
}: ParticipantsProps): JSX.Element => {
	const [t] = useTranslation();
	const account = useUserAccount();
	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ horizontal: 'small', bottom: 'extrasmall' }}
		>
			{event?.resource?.iAmOrganizer && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Padding right="small">
						<Avatar size="small" label={account.name || account.displayName} />
					</Padding>

					<Text overflow="break-word" weight="bold">
						{t('message.you', 'You')}&nbsp;
					</Text>
					<Text overflow="break-word"> {t('message.are_organizer', 'are the organizer')}</Text>
				</Row>
			)}
			{!event?.resource?.iAmOrganizer && !event?.resource?.calendar?.owner && (
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
			{!event?.resource?.iAmOrganizer && event?.resource?.calendar?.owner && (
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
			<ParticipantsDisplayer participants={participants} event={event} />
		</Container>
	);
};
