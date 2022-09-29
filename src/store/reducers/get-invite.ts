/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { InvitesSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getInviteFulfilled(state: InvitesSlice, { meta, payload }: any): void {
	const { m } = payload;
	const invite = normalizeInvite(m);
	state.invites = {
		...state.invites,
		[meta.arg.inviteId]: invite
	};
}

export function getInviteRejected(state: InvitesSlice): void {
	debugger;
	state.status = 'error';
}
