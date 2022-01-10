/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const moveAppointmentPending = (state: any, { meta }: any) => {
	if (meta.arg.fromMail) {
		// do some stuff if required in future
	} else {
		const { l, id } = meta.arg;
		// eslint-disable-next-line no-param-reassign
		meta.prevApntState = state.appointments;
		state.appointments[id].l = l;
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const moveAppointmentFulfilled = (state: any): void => {
	state.status = 'completed';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const moveAppointmentRejected = (state: any, { meta }: any) => {
	if (!meta.arg.fromMail) {
		state.appointments = meta.arg.prevApntState;
	}
};
