/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { extractBody } from '../commons/body-message-renderer';
import { Invite } from '../types/store/invite';

/**
 * Check if the invite has valid a description. The check is done on the plain text description only.
 * It returns true if the invite has a description that:
 * - it not empty
 * - doesn't contain only whitespaces
 * - doesn't contain only a double quote (there is an issue with the appointment description, a refactor is needed)
 * - doesn't contain only a reference to a virtual room/meeting room
 * @param invite
 */
export const hasDescription = (invite: Invite): boolean => {
	const rawContent = invite?.textDescription?.[0]?._content;
	if (rawContent === undefined || rawContent.trim() === '') {
		return false;
	}

	const body = extractBody(rawContent);
	if (body === undefined || body.trim() === '' || body === '"') {
		return false;
	}

	return true;
};
