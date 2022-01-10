/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Avatar, Container, Row, Text, Padding } from '@zextras/zapp-ui';
import { useTranslation, Trans } from 'react-i18next';
import { useUserAccounts } from '@zextras/zapp-shell';
import ParticipantsDisplayerSmall from './participants-displayer-small';

export default function ParticipantsPart({ event, organizer, participants }) {
	const [t] = useTranslation();
	const accounts = useUserAccounts();
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
						<Avatar size="small" label={accounts[0].name || accounts[0].displayName} />
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
			<ParticipantsDisplayerSmall participants={participants} event={event} />
		</Container>
	);
}
