/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import type { InviteChangeParticipant, InviteChanges } from '../../../types/invite-changes';

const PARTICIPANTS_INLINE_THRESHOLD = 3;
const MESSAGE_INLINE_MAX_LENGTH = 80;

const BannerContainer = styled(Container)`
	background-color: ${({ theme }): string => theme.palette.infoBanner.regular};
	border-radius: 0.5rem;
	padding: ${({ theme }): string => theme.sizes.padding.medium};
	margin-bottom: ${({ theme }): string => theme.sizes.padding.medium};
`;

const ToggleRow = styled(Row)`
	cursor: pointer;
	&:hover span {
		text-decoration: none;
	}
`;

const ToggleText = styled(Text)`
	text-decoration: underline;
`;

const ExpandToggle: FC<{
	label: string;
	expanded: boolean;
	onClick: () => void;
	testId: string;
}> = ({ label, expanded, onClick, testId }): ReactElement => (
	<ToggleRow
		data-testid={testId}
		onClick={onClick}
		mainAlignment="flex-end"
		crossAlignment="center"
	>
		<ToggleText color="info" size="small">
			{label}
		</ToggleText>
		<Row padding={{ left: 'extrasmall' }}>
			<Icon icon={expanded ? 'ChevronUpOutline' : 'ChevronDownOutline'} color="info" size="small" />
		</Row>
	</ToggleRow>
);

const FieldRow: FC<{ label: string; children: ReactElement | string }> = ({
	label,
	children
}): ReactElement => (
	<Row
		width="100%"
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ top: 'extrasmall' }}
	>
		<Row padding={{ right: 'extrasmall' }}>
			<Text weight="bold" size="small">
				{label}:
			</Text>
		</Row>
		<Row takeAvailableSpace mainAlignment="flex-start">
			{typeof children === 'string' ? <Text size="small">{children}</Text> : children}
		</Row>
	</Row>
);

const isMessageDetailed = (message: NonNullable<InviteChanges['message']>): boolean =>
	message.before.length + message.after.length > MESSAGE_INLINE_MAX_LENGTH ||
	message.before.includes('\n') ||
	message.after.includes('\n');

const formatParticipant = (participant: InviteChangeParticipant): string =>
	participant.d ?? participant.a;

const formatParticipantLine = (prefix: '+' | '-', participant: InviteChangeParticipant): string =>
	`${prefix} ${formatParticipant(participant)}`;

const DetailedContent: FC<{ children: React.ReactNode }> = ({ children }): ReactElement => (
	<Container crossAlignment="flex-start" padding={{ top: 'extrasmall', left: 'large' }}>
		{children}
	</Container>
);

export const InviteChangesBanner: FC<{ changes: InviteChanges }> = ({
	changes
}): ReactElement | null => {
	const [t] = useTranslation();
	const noMessageLabel = t('label.no_message', '(no message)');
	const formatMessageSide = (text: string): string => text || noMessageLabel;
	const [isMessageExpanded, setIsMessageExpanded] = useState(false);
	const [isParticipantsExpanded, setIsParticipantsExpanded] = useState(false);

	const participantsCount =
		(changes.participants?.added.length ?? 0) + (changes.participants?.removed.length ?? 0);
	const isParticipantsDetailed = participantsCount > PARTICIPANTS_INLINE_THRESHOLD;
	const isMessageChangeDetailed = !!changes.message && isMessageDetailed(changes.message);

	const dateTimeLabel = changes.dateTime
		? `${changes.dateTime.before} → ${changes.dateTime.after}`
		: undefined;

	if (!changes.message && !changes.dateTime && !changes.participants) {
		return null;
	}

	return (
		<BannerContainer data-testid="invite-changes-banner" width="100%" crossAlignment="flex-start">
			<Row width="100%" mainAlignment="flex-start">
				<Row padding={{ right: 'small' }}>
					<Icon icon="InfoOutline" color="info" size="large" />
				</Row>
				<Text weight="bold">{t('label.invitation_updated', 'This invitation was updated')}</Text>
			</Row>
			<Container crossAlignment="flex-start" padding={{ top: 'small' }}>
				{dateTimeLabel && (
					<FieldRow label={t('label.date_and_time', 'Date & Time')}>{dateTimeLabel}</FieldRow>
				)}
				{changes.participants && (
					<FieldRow label={t('label.participants', 'Participants')}>
						{isParticipantsDetailed ? (
							<Row width="100%" crossAlignment="flex-start">
								<Row width="100%" mainAlignment="space-between" crossAlignment="center">
									<Text size="small">
										{t('label.participants_added_removed', '{{added}} added, {{removed}} removed', {
											added: changes.participants.added.length,
											removed: changes.participants.removed.length
										})}
									</Text>
									<ExpandToggle
										testId="invite-changes-participants-toggle"
										expanded={isParticipantsExpanded}
										onClick={(): void => setIsParticipantsExpanded((prev) => !prev)}
										label={
											isParticipantsExpanded
												? t('label.hide', 'Hide')
												: t('label.view_names', 'View names')
										}
									/>
								</Row>
								{isParticipantsExpanded && (
									<DetailedContent>
										{[
											...changes.participants.added.map((participant, index) => (
												<Text key={`added-${index}`} size="small" overflow="break-word">
													{formatParticipantLine('+', participant)}
												</Text>
											)),
											...changes.participants.removed.map((participant, index) => (
												<Text key={`removed-${index}`} size="small" overflow="break-word">
													{formatParticipantLine('-', participant)}
												</Text>
											))
										]}
									</DetailedContent>
								)}
							</Row>
						) : (
							[
								...changes.participants.added.map((p) => formatParticipantLine('+', p)),
								...changes.participants.removed.map((p) => formatParticipantLine('-', p))
							].join(', ')
						)}
					</FieldRow>
				)}
				{changes.message && (
					<FieldRow label={t('label.message', 'Message')}>
						{isMessageChangeDetailed ? (
							<Row width="100%" crossAlignment="flex-start">
								<Row width="100%" mainAlignment="space-between" crossAlignment="center">
									<Text size="small">{t('label.updated', 'updated')}</Text>
									<ExpandToggle
										testId="invite-changes-message-toggle"
										expanded={isMessageExpanded}
										onClick={(): void => setIsMessageExpanded((prev) => !prev)}
										label={
											isMessageExpanded
												? t('label.hide', 'Hide')
												: t('label.compare_full_text', 'Compare full text')
										}
									/>
								</Row>
								{isMessageExpanded && (
									<DetailedContent>
										<Text size="small" overflow="break-word">
											{t('label.before', 'Before')}: {changes.message.before}
										</Text>
										<Text size="small" overflow="break-word">
											{t('label.after', 'After')}: {changes.message.after}
										</Text>
									</DetailedContent>
								)}
							</Row>
						) : (
							`${formatMessageSide(changes.message.before)} → ${formatMessageSide(changes.message.after)}`
						)}
					</FieldRow>
				)}
			</Container>
		</BannerContainer>
	);
};
