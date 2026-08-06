/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type InviteChangeParticipant = { a: string; d?: string };

// Order mirrors how the banner displays the fields: title, location, virtual
// room, meeting rooms, equipment, participants, date/time, all day, message.
// Meeting rooms and equipment used to be a single combined "resources" field
// (editor-resources.tsx manages both together); the banner now shows them as
// two separate rows, matching the read-only event summary view's own
// meeting-rooms-row.tsx / equipments-row.tsx split.
export type InviteChanges = {
	title?: { before: string; after: string };
	location?: { before: string; after: string };
	virtualRoom?: { before: string; after: string };
	meetingRooms?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
	equipment?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
	participants?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
	dateTime?: { before: string; after: string };
	allDay?: { before: boolean; after: boolean };
	message?: { before: string; after: string };
};
