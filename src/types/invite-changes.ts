/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type InviteChangeParticipant = { a: string; d?: string };

export type InviteChanges = {
	message?: { before: string; after: string };
	dateTime?: { before: string; after: string };
	participants?: {
		added: InviteChangeParticipant[];
		removed: InviteChangeParticipant[];
	};
};
