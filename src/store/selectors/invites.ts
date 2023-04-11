/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Invite } from '../../types/store/invite';
import type { RootState } from '../redux';

export const selectInstanceInvite =
	(inviteId?: string): ((state: RootState) => Invite | undefined) =>
	(state: RootState): Invite | undefined =>
		inviteId ? state?.invites?.invites?.[inviteId] : undefined;
