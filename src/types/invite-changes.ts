/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type InviteChangeParticipant = { a: string; d?: string };

// Order mirrors the editor's own field order (src/view/editor/editor-panel.tsx):
// title, location, resources, virtual room, participants, date/time, all day, message.
export type InviteChanges = {
	title?: { before: string; after: string };
	location?: { before: string; after: string };
	resources?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
	virtualRoom?: { before: string; after: string };
	participants?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
	dateTime?: { before: string; after: string };
	allDay?: { before: boolean; after: boolean };
	message?: { before: string; after: string };
};
