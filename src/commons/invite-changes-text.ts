/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { compact, escapeRegExp, takeWhile } from 'lodash';

import { MESSAGE_DIVIDER } from '../constants';
import type { InviteChangeParticipant, InviteChanges } from '../types/invite-changes';

const CHANGES_HEADER = 'What changed:';
const MESSAGE_LABEL = 'Message:';
const DATE_TIME_LABEL = 'Date & Time:';
const PARTICIPANTS_ADDED_LABEL = 'Participants added:';
const PARTICIPANTS_REMOVED_LABEL = 'Participants removed:';

const formatParticipantLine = (prefix: '+' | '-', participant: InviteChangeParticipant): string =>
	participant.d ? `${prefix} ${participant.d} <${participant.a}>` : `${prefix} ${participant.a}`;

const formatParticipantsSection = (
	label: string,
	prefix: '+' | '-',
	participants: InviteChangeParticipant[]
): string | undefined =>
	participants.length > 0
		? `${label}\n${participants.map((participant) => formatParticipantLine(prefix, participant)).join('\n')}`
		: undefined;

export const formatInviteChangesText = (changes: InviteChanges): string => {
	const sections = compact([
		changes.message
			? `${MESSAGE_LABEL}\n${MESSAGE_DIVIDER}\n${changes.message.before}\n${MESSAGE_DIVIDER}\n${changes.message.after}\n${MESSAGE_DIVIDER}`
			: undefined,
		changes.dateTime
			? `${DATE_TIME_LABEL} ${changes.dateTime.before} -> ${changes.dateTime.after}`
			: undefined,
		changes.participants
			? formatParticipantsSection(PARTICIPANTS_ADDED_LABEL, '+', changes.participants.added)
			: undefined,
		changes.participants
			? formatParticipantsSection(PARTICIPANTS_REMOVED_LABEL, '-', changes.participants.removed)
			: undefined
	]);
	return sections.length > 0 ? `${CHANGES_HEADER}\n${sections.join('\n')}` : '';
};

const parseParticipantLine = (line: string): InviteChangeParticipant | undefined => {
	const withName = /^[+-] (.+) <(.+)>$/.exec(line);
	if (withName) {
		return { d: withName[1], a: withName[2] };
	}
	const emailOnly = /^[+-] (.+)$/.exec(line);
	return emailOnly ? { a: emailOnly[1] } : undefined;
};

const parseParticipantsSection = (text: string, label: string): InviteChangeParticipant[] => {
	const labelIndex = text.indexOf(label);
	if (labelIndex === -1) {
		return [];
	}
	const lines = text
		.slice(labelIndex + label.length)
		.split('\n')
		.slice(1);
	return compact(
		takeWhile(lines, (line) => !!parseParticipantLine(line)).map(parseParticipantLine)
	);
};

const parseMessage = (text: string): { before: string; after: string } | undefined => {
	const divider = escapeRegExp(MESSAGE_DIVIDER);
	const match = new RegExp(
		`${divider}\\n([\\s\\S]*?)\\n${divider}\\n([\\s\\S]*?)\\n${divider}`
	).exec(text);
	return match ? { before: match[1], after: match[2] } : undefined;
};

const parseDateTime = (text: string): { before: string; after: string } | undefined => {
	const match = new RegExp(`${escapeRegExp(DATE_TIME_LABEL)} (.*) -> (.*)`).exec(text);
	return match ? { before: match[1], after: match[2] } : undefined;
};

export const parseInviteChangesFromText = (text: string | undefined): InviteChanges | undefined => {
	if (!text || !text.includes(CHANGES_HEADER)) {
		return undefined;
	}

	const changes: InviteChanges = {};

	const message = parseMessage(text);
	if (message) {
		changes.message = message;
	}

	const dateTime = parseDateTime(text);
	if (dateTime) {
		changes.dateTime = dateTime;
	}

	const added = parseParticipantsSection(text, PARTICIPANTS_ADDED_LABEL);
	const removed = parseParticipantsSection(text, PARTICIPANTS_REMOVED_LABEL);
	if (added.length > 0 || removed.length > 0) {
		changes.participants = { added, removed };
	}

	return Object.keys(changes).length > 0 ? changes : undefined;
};
