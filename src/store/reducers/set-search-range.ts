/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppointmentsSlice } from '../../types/store/store';
import { addAppointmentsToStore, replaceAppointmentsToStore } from '../../utils/store/appointments';

export function setRangePending(state: AppointmentsSlice): void {
	state.status = 'loading';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setRangeFulfilled(state: AppointmentsSlice, { payload }: any): void {
	if (payload) replaceAppointmentsToStore(state, payload);
	state.status = 'idle';
}

export function setRangeRejected(state: AppointmentsSlice): void {
	state.status = 'error';
}
