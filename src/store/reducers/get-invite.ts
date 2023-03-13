/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { InvitesSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getInviteFulfilled(state: InvitesSlice, { meta, payload }: any): void {
	state.invites = {
		...state.invites,
		[meta.arg.inviteId]: payload
	};
}

export function getInviteRejected(state: InvitesSlice): void {
	state.status = 'error';
}
