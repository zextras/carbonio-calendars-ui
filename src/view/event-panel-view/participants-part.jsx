/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { Avatar, Container, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation, Trans } from 'react-i18next';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import ParticipantsDisplayer from './participants-displayer';

export default function ParticipantsPart({ event, organizer, participants }) {
	const [t] = useTranslation();
	const text = useMemo(() => t('message.you_are_organizer', 'You are the organizer'), [t]);
	const accounts = useUserAccounts();

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ horizontal: 'large', vertical: 'medium' }}
			background="gray6"
		>
			{event.resource.iAmOrganizer && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						style={{ width: '48px', height: '48px' }}
						label={accounts[0].name || accounts[0].displayName}
					/>
					<Text style={{ padding: '0px 8px' }}>{text}</Text>
				</Row>
			)}
			{!event.resource.iAmOrganizer && !event.resource.owner && (
				<Row
					mainAlignment="flex-start"
					crossAlignment="center"
					width="fill"
					padding={{ bottom: 'medium' }}
				>
					<Avatar
						style={{ width: '48px', height: '48px' }}
						label={organizer.name || organizer.email || organizer.mail}
					/>
					<Text style={{ padding: '0px 8px' }}>
						<Trans
							i18nKey="message.somebody_invited_you"
							defaults="<strong>{{somebody}}</strong> invited you"
							values={{ somebody: organizer.name || organizer.email || organizer.mail }}
						/>
					</Text>
				</Row>
			)}
			<ParticipantsDisplayer participants={participants} />
		</Container>
	);
}
