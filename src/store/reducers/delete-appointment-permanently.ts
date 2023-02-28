/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const deleteAppointmentPermanentlyPending = (state: any, { meta }: any) => {
	const { id } = meta.arg;
	// eslint-disable-next-line no-param-reassign
	meta.prevApntState = state.appointments;
	delete state.appointments[id];
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const deleteAppointmentPermanentlyFulfilled = (state: any): void => {
	state.status = 'completed';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const deleteAppointmentPermanentlyRejected = (state: any, { meta, payload }: any) => {
	state.appointments = meta.arg.prevApntState;
};
