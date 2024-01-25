/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import { forEach, isNil, map, omitBy } from 'lodash';

import { normalizeInviteFromSync } from '../../normalizations/normalize-invite';
import type { Invite } from '../../types/store/invite';
import type { InvitesSlice } from '../../types/store/store';

export const handleModifiedInvitesReducer = (
	state: InvitesSlice,
	action: PayloadAction<Array<Invite>>
): void => {
	const invites = map(action.payload, (inv) => omitBy(normalizeInviteFromSync(inv), isNil));
	forEach(invites, (inv) => {
		if (state?.invites?.[inv.id]) {
			state.invites[inv.id] = { ...state.invites?.[inv.id], ...inv };
		}
	});
};
