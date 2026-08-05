/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { parseInviteChangesFromText } from '../../../commons/invite-changes-text';
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
	const textContent = extractContent(inviteComponent?.desc);
	return parseInviteChangesFromText(textContent);
};

export const useInviteChanges = (mailMsg: MailMsg): InviteChanges | undefined =>
	useMemo(() => parseInviteChanges(mailMsg), [mailMsg]);
