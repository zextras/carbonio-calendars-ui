/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo } from 'react';

import styled from '@emotion/styled';
import { Row, Icon, Text } from '@zextras/carbonio-design-system';
import { Action, getAction } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import ParticipantChip from './participant-chip';
import type { Attendee } from '../../../types/store/invite';
import { useParticipants } from '../hooks/use-participants';

export function mailToContact(contact: object): Action | undefined {
	const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
	return available ? mailTo : undefined;
}

export const LinkText = styled(Text)`
	cursor: pointer;
	text-decoration: underline;
	&:hover {
		text-decoration: none;
	}
`;

type Organizer = {
	a?: string;
	d?: string;
};

type ParticipantsListProps = {
	organizer?: Organizer;
	attendees: Attendee[];
	isReqParticipantList?: boolean;
};

export const ParticipantsList: FC<ParticipantsListProps> = ({
	organizer,
	attendees,
	isReqParticipantList = false
}): ReactElement | null => {
	const { participants, visibleParticipants, hasMoreParticipants, showAllParticipants } =
		useParticipants(attendees, isReqParticipantList);

	const [t] = useTranslation();
	const moreLabel = t('message.more', 'More...');

	const participantLabel = useMemo(
		(): string =>
			t(isReqParticipantList ? 'message.required_participant' : 'message.optional_participant', {
				count: participants.length,
				defaultValue_one: `{{count}} ${isReqParticipantList ? 'Participant' : 'Optional'}`,
				defaultValue_other: `{{count}} ${isReqParticipantList ? 'Participants' : 'Optionals'}`
			}),
		[t, participants.length, isReqParticipantList]
	);

	const composeEmailToParticipant = (participant: { a?: string; d?: string }): void => {
		const contactData = {
			email: {
				email: {
					mail: participant.a
				}
			},
			firstName: participant.d ?? participant.a,
			middleName: ''
		};

		mailToContact(contactData)?.execute();
	};

	if (!isReqParticipantList && participants.length === 0) {
		return null;
	}

	return (
		<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
			<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
				<Icon
					size="large"
					icon={isReqParticipantList ? 'PeopleOutline' : 'OptionalInviteeOutline'}
				/>
			</Row>
			<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
				<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
					<Text overflow="break-word">{participantLabel}</Text>
				</Row>

				{isReqParticipantList && organizer && (
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
						<ParticipantChip
							participant={organizer}
							isOrganizer
							onEmailClick={(): void => composeEmailToParticipant(organizer)}
						/>
					</Row>
				)}

				{visibleParticipants.map((participant, index) => (
					<Row
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'small' }}
						key={`${participant.d ?? participant.a}-${index}`}
					>
						<ParticipantChip participant={participant} />
					</Row>
				))}

				{hasMoreParticipants && (
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
						<LinkText
							color="primary"
							size="medium"
							onClick={showAllParticipants}
							overflow="break-word"
						>
							{moreLabel}
						</LinkText>
					</Row>
				)}
			</Row>
		</Row>
	);
};
