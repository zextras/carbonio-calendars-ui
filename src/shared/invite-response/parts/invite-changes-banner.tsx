/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ParticipantChip from './participant-chip';
import { getTimeStrings } from '../../../hooks/use-get-date-range-converted-to-timezone';
import type { InviteChangeParticipant, InviteChanges } from '../../../types/invite-changes';

const PARTICIPANTS_INLINE_THRESHOLD = 3;
const MESSAGE_INLINE_MAX_LENGTH = 80;

const BannerContainer = styled(Container)`
	background-color: ${({ theme }): string => theme.palette.infoBanner.regular};
	border-radius: 0.5rem;
	padding: ${({ theme }): string => theme.sizes.padding.medium};
	margin-bottom: ${({ theme }): string => theme.sizes.padding.medium};
`;

const ToggleText = styled(Text)`
	cursor: pointer;
	text-decoration: underline;
	&:hover {
		text-decoration: none;
	}
`;

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

export const InviteChangesBanner: FC<{ changes: InviteChanges }> = ({
	changes
}): ReactElement | null => {
	const [t] = useTranslation();
	const noMessageLabel = t('label.no_message', '(no message)');
	const formatMessageSide = (text: string): string => text || noMessageLabel;
	const [isMessageExpanded, setIsMessageExpanded] = useState(false);
	const [isParticipantsExpanded, setIsParticipantsExpanded] = useState(false);
	const [isBodyVisible, setIsBodyVisible] = useState(true);

	const participantsCount =
		(changes.participants?.added.length ?? 0) + (changes.participants?.removed.length ?? 0);
	const isParticipantsDetailed = participantsCount > PARTICIPANTS_INLINE_THRESHOLD;
	const isMessageChangeDetailed = !!changes.message && isMessageDetailed(changes.message);
	const isDetailed = isParticipantsDetailed || isMessageChangeDetailed;

	const dateTimeLabel = useMemo(() => {
		if (!changes.dateTime) return undefined;
		const before = getTimeStrings({
			start: changes.dateTime.before.start,
			end: changes.dateTime.before.end,
			options: {}
		});
		const after = getTimeStrings({
			start: changes.dateTime.after.start,
			end: changes.dateTime.after.end,
			options: {}
		});
		return `${before} → ${after}`;
	}, [changes.dateTime]);

	if (!changes.message && !changes.dateTime && !changes.participants) {
		return null;
	}

	return (
		<BannerContainer data-testid="invite-changes-banner" width="100%" crossAlignment="flex-start">
			<Row width="100%" mainAlignment="space-between">
				<Row>
					<Row padding={{ right: 'small' }}>
						<Icon icon="InfoOutline" color="info" size="large" />
					</Row>
					<Text weight="bold">{t('label.invitation_updated', 'This invitation was updated')}</Text>
				</Row>
				{isDetailed && (
					<ToggleText
						data-testid="invite-changes-toggle"
						color="info"
						size="small"
						onClick={(): void => setIsBodyVisible((prev) => !prev)}
					>
						{isBodyVisible ? t('label.hide', 'Hide') : t('label.show', 'Show')}
					</ToggleText>
				)}
			</Row>
			{isBodyVisible && (
				<Container crossAlignment="flex-start" padding={{ top: 'small' }}>
					{changes.message && (
						<FieldRow label={t('label.message', 'Message')}>
							{isMessageChangeDetailed ? (
								<Row width="100%" crossAlignment="flex-start">
									<Row width="100%" mainAlignment="flex-start">
										<Text size="small">{t('label.updated', 'updated')}</Text>
										<ToggleText
											data-testid="invite-changes-message-toggle"
											color="info"
											size="small"
											onClick={(): void => setIsMessageExpanded((prev) => !prev)}
										>
											&nbsp;
											{isMessageExpanded
												? t('label.hide', 'Hide')
												: t('label.compare_full_text', 'Compare full text')}
										</ToggleText>
									</Row>
									{isMessageExpanded && (
										<Container crossAlignment="flex-start" padding={{ top: 'extrasmall' }}>
											<Text size="small" overflow="break-word">
												{t('label.before', 'Before')}: {changes.message.before}
											</Text>
											<Text size="small" overflow="break-word">
												{t('label.after', 'After')}: {changes.message.after}
											</Text>
										</Container>
									)}
								</Row>
							) : (
								`${formatMessageSide(changes.message.before)} → ${formatMessageSide(changes.message.after)}`
							)}
						</FieldRow>
					)}
					{dateTimeLabel && (
						<FieldRow label={t('label.date_and_time', 'Date & Time')}>{dateTimeLabel}</FieldRow>
					)}
					{changes.participants && (
						<FieldRow label={t('label.participants', 'Participants')}>
							{isParticipantsDetailed ? (
								<Row width="100%" crossAlignment="flex-start">
									<Row width="100%" mainAlignment="flex-start">
										<Text size="small">
											{t(
												'label.participants_added_removed',
												'{{added}} added, {{removed}} removed',
												{
													added: changes.participants.added.length,
													removed: changes.participants.removed.length
												}
											)}
										</Text>
										<ToggleText
											data-testid="invite-changes-participants-toggle"
											color="info"
											size="small"
											onClick={(): void => setIsParticipantsExpanded((prev) => !prev)}
										>
											&nbsp;
											{isParticipantsExpanded
												? t('label.hide', 'Hide')
												: t('label.view_names', 'View names')}
										</ToggleText>
									</Row>
									{isParticipantsExpanded && (
										<Row width="100%" wrap="wrap" padding={{ top: 'extrasmall' }}>
											{[...changes.participants.added, ...changes.participants.removed].map(
												(participant, index) => (
													<Row
														key={`${participant.a}-${index}`}
														padding={{ right: 'extrasmall', bottom: 'extrasmall' }}
													>
														<ParticipantChip participant={participant} />
													</Row>
												)
											)}
										</Row>
									)}
								</Row>
							) : (
								[
									...changes.participants.added.map((p) => `+ ${formatParticipant(p)}`),
									...changes.participants.removed.map((p) => `- ${formatParticipant(p)}`)
								].join(', ')
							)}
						</FieldRow>
					)}
				</Container>
			)}
		</BannerContainer>
	);
};
