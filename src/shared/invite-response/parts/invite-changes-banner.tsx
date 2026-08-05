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
			{typeof children === 'string' ? (
				<Text size="small" overflow="break-word">
					{children}
				</Text>
			) : (
				children
			)}
		</Row>
	</Row>
);

// Header for a field that can be expanded: collapsed shows "label: summary",
// expanded drops the summary and shows just the label, per design.
const ExpandableFieldHeader: FC<{
	label: string;
	summary: string;
	expanded: boolean;
	onToggle: () => void;
	toggleLabel: string;
	testId: string;
}> = ({ label, summary, expanded, onToggle, toggleLabel, testId }): ReactElement => (
	<Row
		width="100%"
		mainAlignment="space-between"
		crossAlignment="center"
		padding={{ top: 'extrasmall' }}
	>
		<Row>
			<Text weight="bold" size="small">
				{expanded ? label : `${label}:`}
			</Text>
			{!expanded && (
				<Text size="small" overflow="break-word">
					&nbsp;{summary}
				</Text>
			)}
		</Row>
		<ExpandToggle testId={testId} expanded={expanded} onClick={onToggle} label={toggleLabel} />
	</Row>
);

// Participants' expanded content is always inline on the same row as the
// label and the toggle (unlike message, whose Previous/Updated text is too
// long to stay on one line and therefore goes on separate rows below).
const InlineFieldHeader: FC<{
	label: string;
	content: string;
	expanded: boolean;
	onToggle: () => void;
	toggleLabel: string;
	testId: string;
}> = ({ label, content, expanded, onToggle, toggleLabel, testId }): ReactElement => (
	<Row
		width="100%"
		mainAlignment="space-between"
		crossAlignment="center"
		padding={{ top: 'extrasmall' }}
	>
		<Row
			takeAvailableSpace
			wrap="wrap"
			mainAlignment="flex-start"
			data-testid={`${testId}-content`}
		>
			<Text weight="bold" size="small">
				{label}:
			</Text>
			<Text size="small" overflow="break-word">
				&nbsp;{content}
			</Text>
		</Row>
		<ExpandToggle testId={testId} expanded={expanded} onClick={onToggle} label={toggleLabel} />
	</Row>
);

const isMessageDetailed = (message: NonNullable<InviteChanges['message']>): boolean =>
	message.before.length + message.after.length > MESSAGE_INLINE_MAX_LENGTH ||
	message.before.includes('\n') ||
	message.after.includes('\n');

type AddedRemoved = { added: InviteChangeParticipant[]; removed: InviteChangeParticipant[] };

const formatParticipant = (participant: InviteChangeParticipant): string =>
	participant.d ?? participant.a;

const formatParticipantLine = (prefix: '+' | '-', participant: InviteChangeParticipant): string =>
	`${prefix} ${formatParticipant(participant)}`;

const formatParticipantsLine = (entities: AddedRemoved): string =>
	[
		...entities.added.map((p) => formatParticipantLine('+', p)),
		...entities.removed.map((p) => formatParticipantLine('-', p))
	].join(', ');

const DetailedContent: FC<{ children: React.ReactNode }> = ({ children }): ReactElement => (
	<Container crossAlignment="flex-start" padding={{ top: 'extrasmall' }}>
		{children}
	</Container>
);

// Label and text are native inline elements (<b>/<span>) inside a single
// Text block, not separate Row flex items — a flex layout would either drop
// the whole text to its own line or hang-indent every wrapped line under
// where the quote started. Plain inline flow wraps like a normal paragraph:
// only the overflow moves down, flush with the label's own left edge.
const MessageDiffLine: FC<{ label: string; text: string; testId: string }> = ({
	label,
	text,
	testId
}): ReactElement => (
	<Row width="100%" padding={{ top: 'extrasmall' }} data-testid={testId}>
		<Text size="small" overflow="break-word">
			<b>{label}:</b> <span>&quot;{text}&quot;</span>
		</Text>
	</Row>
);

const ParticipantsField: FC<{ participants: AddedRemoved }> = ({ participants }): ReactElement => {
	const [t] = useTranslation();
	const [isExpanded, setIsExpanded] = useState(false);
	const count = participants.added.length + participants.removed.length;

	if (count <= PARTICIPANTS_INLINE_THRESHOLD) {
		return (
			<FieldRow label={t('label.participants', 'Participants')}>
				{formatParticipantsLine(participants)}
			</FieldRow>
		);
	}

	return (
		<InlineFieldHeader
			testId="invite-changes-participants-toggle"
			label={t('label.participants', 'Participants')}
			content={
				isExpanded
					? formatParticipantsLine(participants)
					: t('label.participants_added_removed', '{{added}} added, {{removed}} removed', {
							added: participants.added.length,
							removed: participants.removed.length
						})
			}
			expanded={isExpanded}
			onToggle={(): void => setIsExpanded((prev) => !prev)}
			toggleLabel={isExpanded ? t('label.hide', 'Hide') : t('label.view_names', 'View names')}
		/>
	);
};

const MessageField: FC<{ message: NonNullable<InviteChanges['message']> }> = ({
	message
}): ReactElement => {
	const [t] = useTranslation();
	const [isExpanded, setIsExpanded] = useState(false);
	const noMessageLabel = t('label.no_message', '(no message)');
	const formatMessageSide = (text: string): string => text || noMessageLabel;

	if (!isMessageDetailed(message)) {
		return (
			<FieldRow label={t('label.message', 'Message')}>
				{`"${formatMessageSide(message.before)}" → "${formatMessageSide(message.after)}"`}
			</FieldRow>
		);
	}

	return (
		<Container crossAlignment="flex-start" width="100%">
			<ExpandableFieldHeader
				testId="invite-changes-message-toggle"
				label={t('label.message', 'Message')}
				summary={t('label.updated', 'updated')}
				expanded={isExpanded}
				onToggle={(): void => setIsExpanded((prev) => !prev)}
				toggleLabel={
					isExpanded ? t('label.hide', 'Hide') : t('label.compare_full_text', 'Compare full text')
				}
			/>
			{isExpanded && (
				<DetailedContent>
					<MessageDiffLine
						testId="invite-changes-message-previous"
						label={t('label.previous', 'Previous')}
						text={message.before}
					/>
					<MessageDiffLine
						testId="invite-changes-message-updated"
						label={t('label.updated_value', 'Updated')}
						text={message.after}
					/>
				</DetailedContent>
			)}
		</Container>
	);
};

export const InviteChangesBanner: FC<{ changes: InviteChanges }> = ({
	changes
}): ReactElement | null => {
	const [t] = useTranslation();

	// The all-day flag is shown as a suffix on the Date & Time row rather than
	// as a field of its own — with a "-" connector only when it's actually
	// joining onto a date/time range, not when all-day is the only change.
	let allDayWord: string | undefined;
	if (changes.allDay) {
		allDayWord = changes.allDay.after
			? t('label.all_day', 'all day')
			: t('label.not_all_day', 'not all day');
	}
	let dateTimeLabel: string | undefined;
	if (changes.dateTime) {
		dateTimeLabel = `${changes.dateTime.before} → ${changes.dateTime.after}`;
		if (allDayWord) {
			dateTimeLabel += ` - ${allDayWord}`;
		}
	} else if (allDayWord) {
		dateTimeLabel = allDayWord;
	}

	const hasAnyChange = !!(
		changes.title ||
		changes.location ||
		changes.resources ||
		changes.virtualRoom ||
		changes.participants ||
		changes.dateTime ||
		changes.allDay ||
		changes.message
	);
	if (!hasAnyChange) {
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
				{changes.title && (
					<FieldRow label={t('label.title', 'Title')}>
						{`"${changes.title.before}" → "${changes.title.after}"`}
					</FieldRow>
				)}
				{changes.location && (
					<FieldRow label={t('label.location', 'Location')}>
						{`"${changes.location.before}" → "${changes.location.after}"`}
					</FieldRow>
				)}
				{changes.resources && (
					<FieldRow label={t('label.resources', 'Resources')}>
						{formatParticipantsLine(changes.resources)}
					</FieldRow>
				)}
				{changes.virtualRoom && (
					<FieldRow label={t('label.virtual_room', 'Virtual room')}>
						{`${changes.virtualRoom.before} → ${changes.virtualRoom.after}`}
					</FieldRow>
				)}
				{changes.participants && <ParticipantsField participants={changes.participants} />}
				{dateTimeLabel && (
					<FieldRow label={t('label.date_and_time', 'Date & Time')}>{dateTimeLabel}</FieldRow>
				)}
				{changes.message && <MessageField message={changes.message} />}
			</Container>
		</BannerContainer>
	);
};
