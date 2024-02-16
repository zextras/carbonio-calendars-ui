/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Avatar, Container, Row, Text, Chip, useSnackbar } from '@zextras/carbonio-design-system';
import { useUserAccount, t } from '@zextras/carbonio-shell-ui';
import { Trans } from 'react-i18next';

import { ParticipantsDisplayer } from './participants-displayer';
import { ParticipantsDisplayerSmall } from './participants-displayer-small';
import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../../carbonio-ui-commons/types/folder';
import { copyEmailToClipboard, sendMsg } from '../../store/actions/participant-displayer-actions';
import { EventType } from '../../types/event';
import { Invite, InviteOrganizer, InviteParticipants } from '../../types/store/invite';

type ParticipantProps = {
	invite: Invite;
	event: EventType;
	organizer: InviteOrganizer;
	participants: InviteParticipants;
	isSummary?: boolean;
};

export const ParticipantsPart = ({
	invite,
	event,
	organizer,
	participants,
	isSummary
}: ParticipantProps): ReactElement | null => {
	const account = useUserAccount();
	const calendar = useFolder(invite.ciFolder);
	const createSnackbar = useSnackbar();
	const iAmAttendee = useMemo(
		() => (!invite.isOrganizer && !(calendar as LinkFolder)?.owner) ?? false,
		[calendar, invite.isOrganizer]
	);
	return organizer ? (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={isSummary ? { vertical: 'small' } : { horizontal: 'large', vertical: 'medium' }}
			background={'gray6'}
		>
			{invite?.organizer?.a === account.name && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						size={isSummary ? 'small' : 'large'}
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
			{!invite.isOrganizer && !(calendar as LinkFolder)?.owner ? (
				<Row mainAlignment="flex-start" crossAlignment="flex-start" padding={{ vertical: 'small' }}>
					<Avatar
						label={organizer.d ?? organizer.a ?? organizer.url ?? ''}
						size={isSummary ? 'small' : 'large'}
					/>
					<Row
						mainAlignment="flex-start"
						crossAlignment="center"
						takeAvailableSpace
						padding={{ left: 'small' }}
					>
						<Text>
							<Trans
								i18nKey="message.somebody_invited_you"
								defaults="<strong>{{somebody}}</strong> invited you"
								values={{ somebody: organizer.d || organizer.a || organizer.url }}
							/>
						</Text>
						<Row
							mainAlignment="flex-start"
							width="100%"
							padding={{ top: 'extrasmall', bottom: 'extrasmall' }}
						>
							<Chip
								label={organizer.a || organizer.d}
								background={'gray3'}
								color="text"
								data-testid={'Chip'}
								hasAvatar={false}
								actions={[
									{
										id: 'action1',
										label: t('message.send_email', 'Send e-mail'),
										type: 'button',
										icon: 'EmailOutline',
										onClick: () => sendMsg(organizer.a, organizer.d)
									},
									{
										id: 'action2',
										label: t('message.copy', 'Copy'),
										type: 'button',
										icon: 'Copy',
										onClick: () => copyEmailToClipboard(organizer.a, createSnackbar)
									}
								]}
							/>
						</Row>
					</Row>
				</Row>
			) : (
				invite?.organizer?.a !== account.name &&
				!iAmAttendee && (
					<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
						<Avatar
							size={isSummary ? 'small' : 'large'}
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
			{isSummary ? (
				<ParticipantsDisplayerSmall participants={participants} event={event} />
			) : (
				<ParticipantsDisplayer participants={participants} />
			)}
		</Container>
	) : null;
};
