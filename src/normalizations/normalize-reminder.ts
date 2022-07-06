/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ReminderItem } from '../types/appointment-reminder';
import { Appointment } from '../types/store/appointments';

export const normalizeReminderItem = (appointment: Appointment): ReminderItem => ({
	start: new Date(appointment.alarmData[0].alarmInstStart),
	key: `${appointment?.id}-${appointment?.alarmData?.[0]?.alarmInstStart}`,
	isRecurrent: !!appointment.recur ?? false,
	end: new Date(appointment.alarmData[0].alarmInstStart + appointment.dur),
	alarmData: appointment.alarmData,
	location: appointment.alarmData[0].loc ?? appointment.loc,
	name: appointment.alarmData[0].name ?? appointment.name,
	isOrg: appointment.isOrg,
	id: appointment.id,
	inviteId: appointment.inviteId
});
