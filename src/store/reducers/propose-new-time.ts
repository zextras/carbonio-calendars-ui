/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { InvitesSlice } from '../../types/store/store';

// todo: types are wrong somewhere else, needs a type refactor in order to type this properly
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const proposeNewTimeFulfilled = (state: InvitesSlice, { payload }): void => {
	if (payload?.editor?.inviteId) {
		delete state.invites[payload?.editor?.inviteId];
	}
};
