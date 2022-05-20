/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, forEach, isNil, map, omitBy, startsWith } from 'lodash';
import { normalizeAppointmentsFromNotify } from '../../normalizations/normalize-appointments';
import { normalizeInviteFromSync } from '../../normalizations/normalize-invite';
import { AppointmentsSlice, InvitesSlice } from '../../types/store/store';

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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleInviteMetadataReducer = (state: InvitesSlice, { payload }: any): void => {
	const appts = normalizeAppointmentsFromNotify(payload);
	forEach(appts, (appt) => {
		if (appt.meta) {
			map(
				filter(state.invites, (v, k) => startsWith(k, appt.id)),
				(item) => {
					state.invites = {
						...state.invites,
						[item.id]: {
							...state.invites[item.id],
							meta: appt.meta
						}
					};
				}
			);
		}
	});
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleMetadataReducer = (state: AppointmentsSlice, { payload }: any): void => {
	const appts = normalizeAppointmentsFromNotify(payload);
	forEach(appts, (appt) => {
		if (state?.appointments?.[appt.id] && appt.meta) {
			state.appointments = {
				...state.appointments,
				[appt.id]: { ...state?.appointments?.[appt.id], meta: state?.appointments?.[appt.id].meta }
			};
		}
	});
};
