/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep } from 'lodash';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const dismissAppointmentPending = (state: any, { meta }: any) => {
	// eslint-disable-next-line no-param-reassign
	meta.arg.prevState = cloneDeep(state);
	// eslint-disable-next-line array-callback-return
	meta.arg.dismissItems.map((apt: any): void => {
		state.appointments[apt.id].alarmData = undefined;
	});
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const dismissAppointmentFulfilled = (state: any): void => {
	state.status = 'fulFilled';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const dismissAppointmentRejected = (state: any, { meta }: any) => {
	// eslint-disable-next-line no-param-reassign
	state = meta.arg.prevState;
	state.status = 'error';
};
