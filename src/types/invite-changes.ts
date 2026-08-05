/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type InviteChangeParticipant = { a: string; d?: string };

export type InviteChanges = {
	message?: { before: string; after: string };
	dateTime?: {
		before: { start: number; end: number };
		after: { start: number; end: number };
	};
	participants?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
};
