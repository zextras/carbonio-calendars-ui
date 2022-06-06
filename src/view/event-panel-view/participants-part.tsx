/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Avatar, Container, Row, Text } from '@zextras/carbonio-design-system';
import { Trans } from 'react-i18next';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { EventType } from '../../types/event';
import { InviteParticipants } from '../../types/store/invite';
import { ParticipantsDisplayer } from './participants-displayer';

type ParticipantProps = {
	event: EventType;
	organizer: {
		name?: string;
		email?: string;
		mail?: string;
	};
	participants: InviteParticipants;
};

export const ParticipantsPart = ({
	event,
	organizer,
	participants
}: ParticipantProps): JSX.Element => {
	const account = useUserAccount();

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
			{event?.resource?.organizer?.email === account.name && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						style={{ width: '48px', height: '48px' }}
						label={account.name || account.displayName}
					/>
					<Text style={{ padding: '0px 8px' }}>
						<Trans
							i18nKey="message.you_are_organizer"
							defaults="<Row><Text> <BoldText> You  </BoldText> are the organizer </Text></Row>"
							components={{
								Row: <Row />,
								Text: <Text color="secondary" />,
								BoldText: <span style={{ fontWeight: 'bold', color: '#333333' }} />
							}}
						/>
					</Text>
				</Row>
			)}
			{!event.resource.iAmOrganizer && !event.resource.calendar?.owner ? (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
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
			) : (
				event?.resource?.organizer?.email !== account.name &&
				!event?.resource?.iAmAttendee && (
					<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
						<Avatar
							style={{ width: '48px', height: '48px' }}
							label={organizer.name || organizer.email || organizer.mail || ''}
						/>
						<Text style={{ padding: '0px 8px' }}>
							<Trans
								i18nKey="message.somebody_is_organizer"
								defaults="<strong>{{somebody}}</strong> is the organizer"
								values={{ somebody: organizer.name || organizer.email }}
							/>
						</Text>
					</Row>
				)
			)}
			<ParticipantsDisplayer participants={participants} />
		</Container>
	);
};
