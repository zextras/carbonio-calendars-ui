/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import { SnoozeCalendarItemAlarmRejectedType } from '../../soap/snooze-calendar-item-alarm-request';
import { AppointmentsSlice, PendingResponse, RejectedResponse } from '../../types/store/store';
import { SnoozeApptReminderArguments } from '../actions/snooze-appointment-reminder';

export const snoozeApptReminderPending = (
	state: AppointmentsSlice,
	{ meta }: PayloadAction<unknown, string, PendingResponse<SnoozeApptReminderArguments>>
): void => {
	// eslint-disable-next-line no-param-reassign
	meta.arg.previousState = cloneDeep(state.appointments);
	const alarmData = state?.appointments?.[meta.arg.id]?.alarmData;
	if (alarmData && alarmData?.[0]?.nextAlarm) {
		alarmData[0].nextAlarm = meta.arg.until;
	}
};

export const snoozeApptReminderFulfilled = (state: AppointmentsSlice): void => {
	state.status = 'fulFilled';
};

export const snoozeApptReminderRejected = (
	state: AppointmentsSlice,
	{
		meta
	}: PayloadAction<
		SnoozeCalendarItemAlarmRejectedType | undefined,
		string,
		RejectedResponse<SnoozeApptReminderArguments>,
		SerializedError
	>
): void => {
	if (meta.arg.previousState) {
		state.appointments = meta.arg.previousState;
	}
	state.status = 'error';
};
