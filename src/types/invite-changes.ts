/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type InviteChangeParticipant = { a: string; d?: string };

// Order mirrors how the banner displays the fields: title, location, virtual
// room, meeting rooms, equipment, participants, date/time, message.
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
	// beforeAllDay/afterAllDay travel with the formatted before/after strings
	// (rather than as a standalone field) so the banner can append its own
	// translated "All day" wording per side, in the viewer's own locale, the
	// same way it already does for every other UI string here — the baked-in
	// before/after text itself is still necessarily formatted in whatever
	// locale the sender's app was running in (date-fns weekday/month names),
	// same tradeoff already accepted for the rest of this diff.
	dateTime?: { before: string; after: string; beforeAllDay: boolean; afterAllDay: boolean };
	message?: { before: string; after: string };
};
