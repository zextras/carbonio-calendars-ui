/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Invite } from '../../types/store/invite';
import { Store } from '../../types/store/store';

export const selectInstanceInvite =
	(inviteId?: string): ((state: Store) => Invite | undefined) =>
	(state: Store): Invite | undefined =>
		inviteId ? state?.invites?.invites?.[inviteId] : undefined;
