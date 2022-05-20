/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach, isNil, map, omitBy } from 'lodash';
import { normalizeInviteFromSync } from '../../normalizations/normalize-invite';
import { InvitesSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleModifiedInvitesReducer = (state: InvitesSlice, { payload }: any): void => {
	const invites = map(payload, (inv) => omitBy(normalizeInviteFromSync(inv), isNil));
	forEach(invites, (inv) => {
		if (state?.invites?.[inv.id]) {
			state.invites = {
				...state.invites,
				[inv.id]: { ...state.invites?.[inv.id], ...inv }
			};
		}
	});
};
