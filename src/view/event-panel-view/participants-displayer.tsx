/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Avatar,
	Container,
	Row,
	Text,
	Chip,
	useSnackbar,
	Button,
	Padding
} from '@zextras/carbonio-design-system';
import { t, useUserAccount } from '@zextras/carbonio-shell-ui';
import { isEmpty } from 'lodash';

import { SelfResponseStatusText } from './self-response-status-text';
import { copyEmailToClipboard, sendMsg } from '../../store/actions/participant-displayer-actions';
import { EventType } from '../../types/event';
import { InviteParticipant, InviteParticipants } from '../../types/store/invite';
import { flattenInviteParticipants, isLoggedInUserAmongParticipants } from '../../utils/attendees';

export const DisplayedParticipant = ({
	participant,
	width
}: {
	participant: InviteParticipant;
	width?: string;
}): ReactElement => {
	const createSnackbar = useSnackbar();
	return (
		<Row
			data-testid={'DisplayedParticipant'}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ vertical: 'small' }}
			width={width}
		>
			<Avatar
				label={participant.name || participant.email}
				style={{ width: '3rem', height: '3rem' }}
			/>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				takeAvailableSpace
				padding={{ left: 'small' }}
			>
				<Text>{participant.name || participant.email}</Text>

				<Row
					mainAlignment="flex-start"
					width="100%"
					padding={{ top: 'extrasmall', bottom: 'extrasmall' }}
				>
					<Chip
						label={participant.email}
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
								onClick: () => sendMsg(participant.email, participant.name)
							},
							{
								id: 'action2',
								label: t('message.copy', 'Copy'),
								type: 'button',
								icon: 'Copy',
								onClick: () => copyEmailToClipboard(participant.email, createSnackbar)
							}
						]}
					/>
				</Row>

				<Text size="small" color="secondary">
					{`(${
						participant.isOptional
							? t('label.optional', 'Optional')
							: t('label.required', 'Required')
					})`}
				</Text>
			</Row>
		</Row>
	);
};

type DropdownProps = {
	label: string;
	participants?: Array<InviteParticipant>;
	width: string;
	itemWidth?: string;
};

const Dropdown = ({
	label,
	participants,
	width,
	itemWidth
}: DropdownProps): ReactElement | null => {
	const [isExpanded, setIsExpanded] = useState(true);
	const toggleExpanded = useCallback(() => setIsExpanded((prevExpanded) => !prevExpanded), []);

	const displayedParticipants = useMemo(
		() => (
			<Container mainAlignment="space-between" crossAlignment="flex-start" wrap="wrap" width="fill">
				{participants?.map((participant) => (
					<DisplayedParticipant
						participant={participant}
						key={participant.email}
						width={itemWidth}
					/>
				))}
			</Container>
		),
		[participants, itemWidth]
	);

	return participants ? (
		<>
			{participants?.length > 0 && (
				<Container
					orientation="vertical"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width={width}
					height="fit"
				>
					<Row mainAlignment="flex-start" takeAvailableSpace>
						<Text size="small">{label}</Text>
						<Padding right="small" />
						<Button
							icon={isExpanded ? 'ChevronUp' : 'ChevronDown'}
							onClick={toggleExpanded}
							size="small"
							type={'ghost'}
							color={'gray0'}
						/>
					</Row>
					{isExpanded && displayedParticipants}
				</Container>
			)}
		</>
	) : null;
};

export const ParticipantsDisplayer = ({
	participants,
	event,
	canSeeResponseStatus
}: {
	participants: InviteParticipants;
	event: EventType;
	canSeeResponseStatus: boolean;
}): ReactElement | null => {
	const loggedInUser = useUserAccount();
	const width = Object.keys(participants).length === 1 ? '100%' : '50%';
	if (isEmpty(participants)) return null;
	if (Object.keys(participants).length === 0) return null;

	// Response updates are only ever delivered to the organizer: a non-editor attendee can't
	// reliably know other participants' status, so they only get a flat, unlabeled list plus
	// their own status (see CO-4136).
	if (!canSeeResponseStatus) {
		const allParticipants = flattenInviteParticipants(participants);
		const isLoggedInUserAttendee = isLoggedInUserAmongParticipants(allParticipants, loggedInUser);
		return (
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
				height="fit"
				padding={{ top: 'large' }}
			>
				{isLoggedInUserAttendee && (
					<SelfResponseStatusText participationStatus={event.resource.participationStatus} />
				)}
				<Container
					wrap="wrap"
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="fill"
					height="fit"
				>
					<Dropdown
						label={t('participants.Attendees_with_count', {
							count: allParticipants.length,
							defaultValue_one: 'Attendee',
							defaultValue_other: 'Attendees ({{count}})'
						}).toUpperCase()}
						participants={allParticipants}
						width="100%"
						itemWidth="50%"
					/>
				</Container>
			</Container>
		);
	}

	return (
		<Container
			wrap="wrap"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ top: 'large' }}
		>
			{participants?.AC && participants?.AC?.length > 0 && (
				<Dropdown
					label={t('participants.AC_with_count', {
						count: participants.AC?.length ?? 0,
						defaultValue_one: 'Accepted',
						defaultValue_other: 'Accepted ({{count}})'
					}).toUpperCase()}
					participants={participants.AC}
					width={width}
				/>
			)}
			{participants?.NE && participants?.NE?.length > 0 && (
				<Dropdown
					label={t('participants.NE_with_count', {
						count: participants.NE?.length ?? 0,
						defaultValue_one: "Didn't answer ({{count}})",
						defaultValue_other: "Didn't answer ({{count}})"
					}).toUpperCase()}
					participants={participants.NE}
					width={width}
				/>
			)}
			{participants?.TE && participants?.TE?.length > 0 && (
				<Dropdown
					label={t('participants.TE_with_count', {
						count: participants?.TE?.length ?? 0,
						defaultValue_one: 'Tentative',
						defaultValue_other: 'Tentative ({{count}})'
					}).toUpperCase()}
					participants={participants.TE}
					width={width}
				/>
			)}
			{participants?.DE && participants?.DE?.length > 0 && (
				<Dropdown
					label={t('participants.DE_with_count', {
						count: participants.DE?.length ?? 0,
						defaultValue_one: 'Declined',
						defaultValue_other: 'Declined ({{count}})'
					}).toUpperCase()}
					participants={participants.DE}
					width={width}
				/>
			)}
		</Container>
	);
};
