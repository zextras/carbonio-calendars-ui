/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction } from '@reduxjs/toolkit';

import { normalizeInvite } from '../../normalizations/normalize-invite';
import { GetMessageReturnType } from '../../soap/get-message-request';
import { FulfilledResponse, InvitesSlice } from '../../types/store/store';
import { GetInviteArguments } from '../actions/get-invite';

export function getInviteFulfilled(
	state: InvitesSlice,
	action: PayloadAction<GetMessageReturnType, string, FulfilledResponse<GetInviteArguments>>
): void {
	const { m } = action.payload;
	state.invites[action.meta.arg.inviteId] = normalizeInvite(m?.[0]);
}

export function getInviteRejected(state: InvitesSlice): void {
	state.status = 'error';
}
