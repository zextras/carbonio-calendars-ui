/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CalendarMsg, Store } from '../../types/store/store';

export function selectInstanceInvite(state: Store, inviteId: string): CalendarMsg {
	return state?.invites?.invites?.[inviteId] ?? undefined;
}
