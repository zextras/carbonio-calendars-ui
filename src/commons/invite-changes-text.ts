/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { compact, takeWhile } from 'lodash';

import { ROOM_DIVIDER } from '../constants';
import type { InviteChangeParticipant, InviteChanges } from '../types/invite-changes';

// Fixed, never-translated tags, always on their own line, with the value(s)
// starting on the line right after. Parsing anchors only on these tags.
const TITLE_TAG = '[title]';
const LOCATION_TAG = '[location]';
const VIRTUAL_ROOM_TAG = '[virtualroom]';
const MEETING_ROOMS_ADDED_TAG = '[meetingroomadded]';
const MEETING_ROOMS_REMOVED_TAG = '[meetingroomremoved]';
const EQUIPMENT_ADDED_TAG = '[equipmentadded]';
const EQUIPMENT_REMOVED_TAG = '[equipmentremoved]';
const PARTICIPANTS_ADDED_TAG = '[added]';
const PARTICIPANTS_REMOVED_TAG = '[removed]';
const DATE_TIME_TAG = '[datetime]';
const MESSAGE_BEFORE_TAG = '[before]';
const MESSAGE_AFTER_TAG = '[after]';

type SimpleDiff = { before: string; after: string };
type DateTimeDiff = SimpleDiff & { beforeAllDay: boolean; afterAllDay: boolean };

const formatSimpleDiff = (tag: string, diff?: SimpleDiff): string | undefined =>
	diff ? `${tag}\n${diff.before} -> ${diff.after}` : undefined;

// The all-day flags travel as a second line right after the before/after
// line, rather than as a separate tagged section: they're meaningless
// without the date/time diff they belong to, so keeping them physically
// attached avoids the two ever getting out of sync while parsing.
const formatDateTimeDiff = (diff?: DateTimeDiff): string | undefined =>
	diff
		? `${DATE_TIME_TAG}\n${diff.before} -> ${diff.after}\n${diff.beforeAllDay} ${diff.afterAllDay}`
		: undefined;

const formatParticipantLine = (prefix: '+' | '-', participant: InviteChangeParticipant): string =>
	participant.d ? `${prefix} ${participant.d} <${participant.a}>` : `${prefix} ${participant.a}`;

const formatParticipantsSection = (
	tag: string,
	prefix: '+' | '-',
	participants: InviteChangeParticipant[]
): string | undefined =>
	participants.length > 0
		? `${tag}\n${participants.map((participant) => formatParticipantLine(prefix, participant)).join('\n')}`
		: undefined;

// Order mirrors the editor's own field order. The message diff is always
// emitted last: it's the only free-form, multi-line field, so it's bounded
// by the outer ROOM_DIVIDER that already wraps this whole block — no
// separate/nested divider needed for it.
export const formatInviteChangesText = (changes: InviteChanges): string => {
	const sections = compact([
		formatSimpleDiff(TITLE_TAG, changes.title),
		formatSimpleDiff(LOCATION_TAG, changes.location),
		formatSimpleDiff(VIRTUAL_ROOM_TAG, changes.virtualRoom),
		changes.meetingRooms
			? formatParticipantsSection(MEETING_ROOMS_ADDED_TAG, '+', changes.meetingRooms.added)
			: undefined,
		changes.meetingRooms
			? formatParticipantsSection(MEETING_ROOMS_REMOVED_TAG, '-', changes.meetingRooms.removed)
			: undefined,
		changes.equipment
			? formatParticipantsSection(EQUIPMENT_ADDED_TAG, '+', changes.equipment.added)
			: undefined,
		changes.equipment
			? formatParticipantsSection(EQUIPMENT_REMOVED_TAG, '-', changes.equipment.removed)
			: undefined,
		changes.participants
			? formatParticipantsSection(PARTICIPANTS_ADDED_TAG, '+', changes.participants.added)
			: undefined,
		changes.participants
			? formatParticipantsSection(PARTICIPANTS_REMOVED_TAG, '-', changes.participants.removed)
			: undefined,
		formatDateTimeDiff(changes.dateTime),
		changes.message
			? `${MESSAGE_BEFORE_TAG}\n${changes.message.before}\n${MESSAGE_AFTER_TAG}\n${changes.message.after}`
			: undefined
	]);
	return sections.join('\n');
};

const parseParticipantLine = (line: string): InviteChangeParticipant | undefined => {
	const withName = /^[+-] (.+) <(.+)>$/.exec(line);
	if (withName) {
		return { d: withName[1], a: withName[2] };
	}
	const emailOnly = /^[+-] (.+)$/.exec(line);
	return emailOnly ? { a: emailOnly[1] } : undefined;
};

const parseParticipantsSection = (text: string, tag: string): InviteChangeParticipant[] => {
	const tagIndex = text.indexOf(tag);
	if (tagIndex === -1) {
		return [];
	}
	const lines = text.slice(tagIndex).split('\n').slice(1);
	return compact(
		takeWhile(lines, (line) => !!parseParticipantLine(line)).map(parseParticipantLine)
	);
};

const lineStart = (text: string, index: number): number => text.lastIndexOf('\n', index - 1) + 1;
const lineEnd = (text: string, index: number): number => {
	const nextNewline = text.indexOf('\n', index);
	return nextNewline === -1 ? text.length : nextNewline;
};

// Anchors purely on tag positions and line boundaries.
const parseMessage = (text: string): SimpleDiff | undefined => {
	const beforeTagIndex = text.indexOf(MESSAGE_BEFORE_TAG);
	const afterTagIndex = text.indexOf(MESSAGE_AFTER_TAG);
	if (beforeTagIndex === -1 || afterTagIndex === -1) {
		return undefined;
	}

	const beforeValueStart = lineEnd(text, beforeTagIndex) + 1;
	const afterTagLineStart = lineStart(text, afterTagIndex);
	const afterValueStart = lineEnd(text, afterTagIndex) + 1;

	const closingDividerIndex = text.indexOf(`\n${ROOM_DIVIDER}`, afterValueStart);
	const afterValueEnd = closingDividerIndex === -1 ? text.length : closingDividerIndex;

	return {
		before: text.slice(beforeValueStart, afterTagLineStart).replace(/\n$/, ''),
		after: text.slice(afterValueStart, afterValueEnd)
	};
};

const parseSimpleDiff = (text: string, tag: string): SimpleDiff | undefined => {
	const tagIndex = text.indexOf(tag);
	if (tagIndex === -1) {
		return undefined;
	}
	const valueStart = lineEnd(text, tagIndex) + 1;
	const valueEnd = lineEnd(text, valueStart);
	const match = /^(.*) -> (.*)$/.exec(text.slice(valueStart, valueEnd));
	return match ? { before: match[1], after: match[2] } : undefined;
};

// The all-day flags line sits right after the before/after line written by
// formatDateTimeDiff; parseSimpleDiff already lands valueEnd at the end of
// that first line, so the flags line starts right after it.
const parseDateTimeDiff = (text: string): DateTimeDiff | undefined => {
	const diff = parseSimpleDiff(text, DATE_TIME_TAG);
	if (!diff) {
		return undefined;
	}
	const tagIndex = text.indexOf(DATE_TIME_TAG);
	const diffLineEnd = lineEnd(text, lineEnd(text, tagIndex) + 1);
	const flagsLineStart = diffLineEnd + 1;
	const flagsLineEnd = lineEnd(text, flagsLineStart);
	const flagsMatch = /^(true|false) (true|false)$/.exec(text.slice(flagsLineStart, flagsLineEnd));
	return {
		...diff,
		beforeAllDay: flagsMatch ? flagsMatch[1] === 'true' : false,
		afterAllDay: flagsMatch ? flagsMatch[2] === 'true' : false
	};
};

export const parseInviteChangesFromText = (
	rawText: string | undefined
): InviteChanges | undefined => {
	if (!rawText) {
		return undefined;
	}

	// The mail transport layer may normalize line endings to CRLF. Every line
	// boundary below is matched as a bare "\n", so normalize once up front
	// rather than accounting for a possible trailing "\r" everywhere.
	const text = rawText.replaceAll(/\r\n?/g, '\n');

	const changes: InviteChanges = {};

	const title = parseSimpleDiff(text, TITLE_TAG);
	if (title) {
		changes.title = title;
	}

	const location = parseSimpleDiff(text, LOCATION_TAG);
	if (location) {
		changes.location = location;
	}

	const virtualRoom = parseSimpleDiff(text, VIRTUAL_ROOM_TAG);
	if (virtualRoom) {
		changes.virtualRoom = virtualRoom;
	}

	const addedMeetingRooms = parseParticipantsSection(text, MEETING_ROOMS_ADDED_TAG);
	const removedMeetingRooms = parseParticipantsSection(text, MEETING_ROOMS_REMOVED_TAG);
	if (addedMeetingRooms.length > 0 || removedMeetingRooms.length > 0) {
		changes.meetingRooms = { added: addedMeetingRooms, removed: removedMeetingRooms };
	}

	const addedEquipment = parseParticipantsSection(text, EQUIPMENT_ADDED_TAG);
	const removedEquipment = parseParticipantsSection(text, EQUIPMENT_REMOVED_TAG);
	if (addedEquipment.length > 0 || removedEquipment.length > 0) {
		changes.equipment = { added: addedEquipment, removed: removedEquipment };
	}

	const added = parseParticipantsSection(text, PARTICIPANTS_ADDED_TAG);
	const removed = parseParticipantsSection(text, PARTICIPANTS_REMOVED_TAG);
	if (added.length > 0 || removed.length > 0) {
		changes.participants = { added, removed };
	}

	const dateTime = parseDateTimeDiff(text);
	if (dateTime) {
		changes.dateTime = dateTime;
	}

	const message = parseMessage(text);
	if (message) {
		changes.message = message;
	}

	return Object.keys(changes).length > 0 ? changes : undefined;
};
