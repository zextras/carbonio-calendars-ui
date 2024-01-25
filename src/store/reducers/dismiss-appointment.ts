/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { cloneDeep, forEach } from 'lodash';

import { DismissCalendarItemAlarmRejectedType } from '../../soap/dismiss-calendar-item-alarm-request';
import { AppointmentsSlice, PendingResponse, RejectedResponse } from '../../types/store/store';
import { DismissApptReminderArguments } from '../actions/dismiss-appointment-reminder';

export const dismissAppointmentPending = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<unknown, string, PendingResponse<DismissApptReminderArguments>>
): void => {
	// eslint-disable-next-line no-param-reassign
	meta.arg.previousState = cloneDeep(state.appointments);
	forEach(meta.arg.dismissItems, (appt: any): void => {
		state.appointments[appt.id].alarmData = undefined;
	});
};

export const dismissAppointmentFulfilled = (state: AppointmentsSlice): void => {
	state.status = 'fulFilled';
};

export const dismissAppointmentRejected = (
	state: AppointmentsSlice,
	{
		meta
	}: PayloadAction<
		DismissCalendarItemAlarmRejectedType | undefined,
		string,
		RejectedResponse<DismissApptReminderArguments>,
		SerializedError
	>
): void => {
	if (meta.arg.previousState) {
		state.appointments = meta.arg.previousState;
	}
	state.status = 'error';
};
