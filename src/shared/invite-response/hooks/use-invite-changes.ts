/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { parseInviteChangesFromText } from '../../../commons/invite-changes-text';
import { extractDescriptionFromParts } from '../../../normalizations/normalize-invite';
import type { MailMsg } from '../../../types/integrations';
import type { InviteChanges } from '../../../types/invite-changes';

const extractContent = (description: unknown): string | undefined => {
	if (Array.isArray(description)) {
		return description[0]?._content;
	}
	if (typeof description === 'string') {
		return description;
	}
	return undefined;
};

const parseInviteChanges = (mailMsg: MailMsg): InviteChanges | undefined => {
	const inviteComponent = mailMsg?.invite?.[0]?.comp?.[0];
	// The invite component's own `desc` is populated when fetching a calendar
	// item directly (e.g. GetAppointment). A calendar invitation email fetched
	// via GetMsg instead carries the actual body in the message's MIME parts,
	// same as normalizeInvite falls back to for rendering the message itself.
	const textContent =
		extractContent(inviteComponent?.desc) ?? extractDescriptionFromParts(mailMsg?.parts ?? []).text;
	return parseInviteChangesFromText(textContent);
};

export const useInviteChanges = (mailMsg: MailMsg): InviteChanges | undefined =>
	useMemo(() => parseInviteChanges(mailMsg), [mailMsg]);
