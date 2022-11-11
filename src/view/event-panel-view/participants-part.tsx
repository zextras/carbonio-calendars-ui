/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';
import { Avatar, Container, Row, Text } from '@zextras/carbonio-design-system';
import { Trans } from 'react-i18next';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { useSelector } from 'react-redux';
import { selectCalendar } from '../../store/selectors/calendars';
import { Invite, InviteOrganizer, InviteParticipants } from '../../types/store/invite';
import { ParticipantsDisplayer } from './participants-displayer';

type ParticipantProps = {
	invite: Invite;
	organizer: InviteOrganizer;
	participants: InviteParticipants;
};

export const ParticipantsPart = ({
	invite,
	organizer,
	participants
}: ParticipantProps): ReactElement => {
	const account = useUserAccount();
	const calendar = useSelector(selectCalendar(invite.ciFolder));
	const iAmAttendee = useMemo(
		() => (!invite.isOrganizer && !calendar?.owner) ?? false,
		[calendar?.owner, invite.isOrganizer]
	);
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
			{invite?.organizer?.a === account.name && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						style={{ width: '3rem', height: '3rem' }}
						label={account.name ?? account.displayName ?? ''}
					/>
					<Text style={{ padding: '0 0.5rem' }}>
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
			{!invite.isOrganizer && !calendar?.owner ? (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						style={{ width: '3rem', height: '3rem' }}
						label={organizer.d ?? organizer.a ?? organizer.url ?? ''}
					/>
					<Text style={{ padding: '0 0.5rem' }}>
						<Trans
							i18nKey="message.somebody_invited_you"
							defaults="<strong>{{somebody}}</strong> invited you"
							values={{ somebody: organizer.d || organizer.a || organizer.url }}
						/>
					</Text>
				</Row>
			) : (
				invite?.organizer?.a !== account.name &&
				!iAmAttendee && (
					<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
						<Avatar
							style={{ width: '3rem', height: '3rem' }}
							label={organizer.d ?? organizer.a ?? organizer.url ?? ''}
						/>
						<Text style={{ padding: '0 0.5rem' }}>
							<Trans
								i18nKey="message.somebody_is_organizer"
								defaults="<strong>{{somebody}}</strong> is the organizer"
								values={{ somebody: organizer.d || organizer.a }}
							/>
						</Text>
					</Row>
				)
			)}
			<ParticipantsDisplayer participants={participants} />
		</Container>
	);
};
