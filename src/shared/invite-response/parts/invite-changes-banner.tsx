/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { InviteChangeParticipant, InviteChanges } from '../../../types/invite-changes';

const ADDED_REMOVED_INLINE_THRESHOLD = 3;
const DIFF_INLINE_MAX_LENGTH = 80;
// Title always counts as one of the visible sections.
const SECTIONS_INLINE_THRESHOLD = 3;

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

const BannerToggleRow = styled(Row)`
	cursor: pointer;
`;

const BannerToggleText = styled(Text)`
	text-transform: uppercase;
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

// Every section but Title identifies itself with an icon instead of a text
// label (Title keeps the bold text label, in both its collapsed "Title:" and
// expanded "Title" forms — icons have no such state to show).
const SectionMarker: FC<{ label?: string; icon?: string; expanded?: boolean }> = ({
	label,
	icon,
	expanded
}): ReactElement =>
	icon ? (
		<Icon icon={icon} size="medium" />
	) : (
		<Text weight="bold" size="small">
			{expanded ? label : `${label}:`}
		</Text>
	);

const FieldRow: FC<{
	label?: string;
	icon?: string;
	children: ReactElement | string;
}> = ({ label, icon, children }): ReactElement => (
	<Row
		width="100%"
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ top: 'extrasmall' }}
	>
		<Row padding={{ right: 'extrasmall' }}>
			<SectionMarker label={label} icon={icon} />
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

// Header for a field that can be expanded: collapsed shows "marker: summary",
// expanded drops the summary and shows just the marker, per design.
const ExpandableFieldHeader: FC<{
	label?: string;
	icon?: string;
	summary: string;
	expanded: boolean;
	onToggle: () => void;
	toggleLabel: string;
	testId: string;
}> = ({ label, icon, summary, expanded, onToggle, toggleLabel, testId }): ReactElement => (
	<Row
		width="100%"
		mainAlignment="space-between"
		crossAlignment="center"
		padding={{ top: 'extrasmall' }}
	>
		<Row>
			<SectionMarker label={label} icon={icon} expanded={expanded} />
			{!expanded && (
				<Text size="small" overflow="break-word">
					&nbsp;{summary}
				</Text>
			)}
		</Row>
		<ExpandToggle testId={testId} expanded={expanded} onClick={onToggle} label={toggleLabel} />
	</Row>
);

// Participants'/resources' expanded content is always inline on the same row
// as the marker and the toggle (unlike a text diff, whose Previous/Updated
// text is too long to stay on one line and therefore goes on separate rows
// below).
const InlineFieldHeader: FC<{
	label?: string;
	icon?: string;
	content: string;
	expanded: boolean;
	onToggle: () => void;
	toggleLabel: string;
	testId: string;
}> = ({ label, icon, content, expanded, onToggle, toggleLabel, testId }): ReactElement => (
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
			<SectionMarker label={label} icon={icon} />
			<Text size="small" overflow="break-word">
				&nbsp;{content}
			</Text>
		</Row>
		<ExpandToggle testId={testId} expanded={expanded} onClick={onToggle} label={toggleLabel} />
	</Row>
);

const isDiffDetailed = (before: string, after: string): boolean =>
	before.length + after.length > DIFF_INLINE_MAX_LENGTH ||
	before.includes('\n') ||
	after.includes('\n');

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
const DiffLine: FC<{ label: string; text: string; quote: boolean; testId: string }> = ({
	label,
	text,
	quote,
	testId
}): ReactElement => (
	<Row width="100%" mainAlignment="flex-start" padding={{ top: 'extrasmall' }} data-testid={testId}>
		<Text size="small" overflow="break-word">
			<b>{label}:</b> <span>{quote ? `"${text}"` : text}</span>
		</Text>
	</Row>
);

const AddedRemovedField: FC<{
	label?: string;
	icon?: string;
	entities: AddedRemoved;
	testId: string;
}> = ({ label, icon, entities, testId }): ReactElement => {
	const [t] = useTranslation();
	const [isExpanded, setIsExpanded] = useState(false);
	const count = entities.added.length + entities.removed.length;

	if (count <= ADDED_REMOVED_INLINE_THRESHOLD) {
		return (
			<FieldRow label={label} icon={icon}>
				{formatParticipantsLine(entities)}
			</FieldRow>
		);
	}

	return (
		<InlineFieldHeader
			testId={testId}
			label={label}
			icon={icon}
			content={
				isExpanded
					? formatParticipantsLine(entities)
					: t('label.participants_added_removed', '{{added}} added, {{removed}} removed', {
							added: entities.added.length,
							removed: entities.removed.length
						})
			}
			expanded={isExpanded}
			onToggle={(): void => setIsExpanded((prev) => !prev)}
			toggleLabel={
				isExpanded
					? t('label.hide_details', 'Hide details')
					: t('label.view_details', 'View details')
			}
		/>
	);
};

// Any before/after text diff (title, location, virtual room, date/time,
// message): inline as "marker: before → after" while it fits, otherwise
// collapsed to "marker: updated" with a toggle that reveals Previous/Updated
// as quoted paragraph text below the marker, same as the message field.
const SimpleDiffField: FC<{
	label?: string;
	icon?: string;
	before: string;
	after: string;
	quote?: boolean;
	emptyPlaceholder?: string;
	testId: string;
}> = ({ label, icon, before, after, quote = false, emptyPlaceholder, testId }): ReactElement => {
	const [t] = useTranslation();
	const [isExpanded, setIsExpanded] = useState(false);

	const resolve = (text: string): string => text || (emptyPlaceholder ?? text);
	const formatSide = (text: string): string => {
		const resolved = resolve(text);
		return quote ? `"${resolved}"` : resolved;
	};

	if (!isDiffDetailed(before, after)) {
		return (
			<FieldRow label={label} icon={icon}>
				{`${formatSide(before)} → ${formatSide(after)}`}
			</FieldRow>
		);
	}

	return (
		<Container crossAlignment="flex-start" width="100%">
			<ExpandableFieldHeader
				testId={`${testId}-toggle`}
				label={label}
				icon={icon}
				summary={t('label.updated', 'updated')}
				expanded={isExpanded}
				onToggle={(): void => setIsExpanded((prev) => !prev)}
				toggleLabel={
					isExpanded
						? t('label.hide_details', 'Hide details')
						: t('label.view_details', 'View details')
				}
			/>
			{isExpanded && (
				<DetailedContent>
					<DiffLine
						testId={`${testId}-previous`}
						label={t('label.previous', 'Previous')}
						text={resolve(before)}
						quote={quote}
					/>
					<DiffLine
						testId={`${testId}-updated`}
						label={t('label.updated_value', 'Updated')}
						text={resolve(after)}
						quote={quote}
					/>
				</DetailedContent>
			)}
		</Container>
	);
};

// Each section is wrapped with a stable testid so its position in the list
// can be asserted regardless of whether it renders a text label (Title) or
// an icon (everything else).
const section = (key: string, element: ReactElement): ReactElement => (
	<Container
		key={key}
		data-testid={`invite-changes-section-${key}`}
		crossAlignment="flex-start"
		width="100%"
	>
		{element}
	</Container>
);

const buildSections = (
	changes: InviteChanges,
	t: TFunction,
	noMessageLabel: string,
	dateTimeAfter: string | undefined,
	allDayWord: string | undefined
): ReactElement[] => {
	const sections: ReactElement[] = [];
	if (changes.title) {
		sections.push(
			section(
				'title',
				<SimpleDiffField
					testId="invite-changes-title"
					label={t('label.title', 'Title')}
					before={changes.title.before}
					after={changes.title.after}
					quote
				/>
			)
		);
	}
	if (changes.location) {
		sections.push(
			section(
				'location',
				<SimpleDiffField
					testId="invite-changes-location"
					icon="PinOutline"
					before={changes.location.before}
					after={changes.location.after}
				/>
			)
		);
	}
	if (changes.virtualRoom) {
		sections.push(
			section(
				'virtualRoom',
				<SimpleDiffField
					testId="invite-changes-virtualroom"
					icon="VideoOutline"
					before={changes.virtualRoom.before}
					after={changes.virtualRoom.after}
				/>
			)
		);
	}
	if (changes.meetingRooms) {
		sections.push(
			section(
				'meetingRooms',
				<AddedRemovedField
					testId="invite-changes-meetingrooms-toggle"
					icon="BuildingOutline"
					entities={changes.meetingRooms}
				/>
			)
		);
	}
	if (changes.equipment) {
		sections.push(
			section(
				'equipment',
				<AddedRemovedField
					testId="invite-changes-equipment-toggle"
					icon="BriefcaseOutline"
					entities={changes.equipment}
				/>
			)
		);
	}
	if (changes.participants) {
		sections.push(
			section(
				'participants',
				<AddedRemovedField
					testId="invite-changes-participants-toggle"
					icon="PeopleOutline"
					entities={changes.participants}
				/>
			)
		);
	}
	if (changes.dateTime) {
		sections.push(
			section(
				'dateTime',
				<SimpleDiffField
					testId="invite-changes-datetime"
					icon="ClockOutline"
					before={changes.dateTime.before}
					after={dateTimeAfter ?? changes.dateTime.after}
				/>
			)
		);
	} else if (allDayWord) {
		sections.push(section('dateTime', <FieldRow icon="ClockOutline">{allDayWord}</FieldRow>));
	}
	if (changes.message) {
		sections.push(
			section(
				'message',
				<SimpleDiffField
					testId="invite-changes-message"
					icon="MessageSquareOutline"
					before={changes.message.before}
					after={changes.message.after}
					quote
					emptyPlaceholder={noMessageLabel}
				/>
			)
		);
	}
	return sections;
};

export const InviteChangesBanner: FC<{ changes: InviteChanges }> = ({
	changes
}): ReactElement | null => {
	const [t] = useTranslation();
	const [isBannerExpanded, setIsBannerExpanded] = useState(false);
	const noMessageLabel = t('label.no_message', '(no message)');

	// The all-day flag is shown as a suffix on the Date & Time row rather than
	// as a field of its own — with a "-" connector only when it's actually
	// joining onto a date/time range, not when all-day is the only change.
	// It's folded into the "after" side (rather than appended once to the
	// whole row) so it survives the field's own expand/collapse the same way
	// the rest of the date/time text does.
	let allDayWord: string | undefined;
	if (changes.allDay) {
		allDayWord = changes.allDay.after
			? t('label.all_day', 'all day')
			: t('label.not_all_day', 'not all day');
	}
	const dateTimeAfter =
		changes.dateTime && allDayWord
			? `${changes.dateTime.after} - ${allDayWord}`
			: changes.dateTime?.after;

	const sections = buildSections(changes, t, noMessageLabel, dateTimeAfter, allDayWord);

	if (sections.length === 0) {
		return null;
	}

	const visibleSections = isBannerExpanded
		? sections
		: sections.slice(0, SECTIONS_INLINE_THRESHOLD);

	return (
		<BannerContainer data-testid="invite-changes-banner" width="100%" crossAlignment="flex-start">
			<Row width="100%" mainAlignment="flex-start">
				<Row padding={{ right: 'small' }}>
					<Icon icon="InfoOutline" color="info" size="large" />
				</Row>
				<Text weight="bold">{t('label.invitation_updated', 'This invitation was updated')}</Text>
			</Row>
			<Container crossAlignment="flex-start" padding={{ top: 'small' }}>
				{visibleSections}
			</Container>
			{sections.length > SECTIONS_INLINE_THRESHOLD && (
				<BannerToggleRow
					data-testid="invite-changes-banner-toggle"
					onClick={(): void => setIsBannerExpanded((prev) => !prev)}
					width="100%"
					mainAlignment="flex-start"
					padding={{ top: 'small' }}
				>
					<BannerToggleText color="info" size="small" weight="bold">
						{isBannerExpanded
							? t('label.show_less_sections', 'Show less')
							: t('label.show_more_sections', 'Show more')}
					</BannerToggleText>
				</BannerToggleRow>
			)}
		</BannerContainer>
	);
};
