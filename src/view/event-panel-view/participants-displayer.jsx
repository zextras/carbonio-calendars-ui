/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Avatar, Container, IconButton, Row, Text } from '@zextras/zapp-ui';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useMemo, useState } from 'react';

function DisplayedParticipant({ participant }) {
	const [t] = useTranslation();
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="center"
			width="212px"
			padding={{ vertical: 'small' }}
		>
			<Avatar
				label={participant.name || participant.email}
				style={{ width: '48px', height: '48px' }}
			/>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				takeAvailableSpace
				padding={{ left: 'small' }}
			>
				<Text overflow="ellipsis">
					{participant.name || participant.email}
					<br />
					<Text size="small" color="secondary">
						{`(${
							participant.isOptional
								? t('label.optional', 'Optional')
								: t('label.required', 'Required')
						})`}
					</Text>
				</Text>
			</Row>
		</Row>
	);
}

function Dropdown({ label, participants = [], width }) {
	const [isExpanded, setIsExpanded] = useState(participants.length < 3);
	const toggleExpanded = useCallback(() => setIsExpanded((prevExpanded) => !prevExpanded), []);

	const displayedParticipants = useMemo(
		() => (
			<Container
				orientation="horizontal"
				mainAlignment="space-between"
				crossAlignment="flex-start"
				wrap="wrap"
				width="fill"
			>
				{participants.map((participant) => (
					<DisplayedParticipant participant={participant} key={participant.email} />
				))}
			</Container>
		),
		[participants]
	);

	return (
		participants.length > 0 && (
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width={width}
				height="fit"
			>
				<Row mainAlignment="flex-start" takeAvailableSpace>
					<Text weight="bold">{label}</Text>
					<IconButton
						icon={isExpanded ? 'ChevronUp' : 'ChevronDown'}
						onClick={toggleExpanded}
						size="small"
					/>
				</Row>
				{isExpanded && displayedParticipants}
			</Container>
		)
	);
}

export default function ParticipantsDisplayer({ participants }) {
	const [t] = useTranslation();
	const width = Object.keys(participants).length === 1 ? '100%' : '50%';
	if (Object.keys(participants).length === 0) return null;
	return (
		<Container
			wrap="wrap"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			heigh="fit"
			padding={{ top: 'large' }}
		>
			<Dropdown
				label={t('participants.AC_with_count', {
					count: participants.AC?.length ?? 0,
					defaultValue: 'Accepted',
					defaultValue_plural: 'Accepted ({{count}})'
				}).toUpperCase()}
				participants={participants.AC}
				width={width}
				style={{ fontWeigth: 400 }}
			/>
			<Dropdown
				label={t('participants.NE_with_count', {
					count: participants.NE?.length ?? 0,
					defaultValue: 'Tentative',
					defaultValue_plural: 'Tentative ({{count}})'
				}).toUpperCase()}
				participants={participants.NE}
				width={width}
				style={{ fontWeigth: 400 }}
			/>
			<Dropdown
				label={t('participants.TE_with_count', {
					count: participants.TE?.length ?? 0,
					defaultValue: 'Declined',
					defaultValue_plural: 'Declined ({{count}})'
				}).toUpperCase()}
				participants={participants.TE}
				width={width}
				style={{ fontWeigth: 400 }}
			/>
			<Dropdown
				label={t('participants.DE_with_count', {
					count: participants.DE?.length ?? 0,
					defaultValue: "Didn't answer (1)",
					defaultValue_plural: "Didn't answer ({{count}})"
				}).toUpperCase()}
				participants={participants.DE}
				width={width}
				style={{ fontWeigth: 400 }}
			/>
		</Container>
	);
}
