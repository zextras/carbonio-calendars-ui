/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ReminderItem } from '../types/appointment-reminder';
import { EventType } from '../types/event';

export const normalizeReminderItem = (appointment: EventType): ReminderItem => ({
	start: new Date(appointment.start.valueOf()),
	key: `${appointment?.resource?.id}-${appointment.resource?.alarmData?.[0]?.alarmInstStart}`,
	isRecurrent: appointment.resource.isRecurrent,
	end: new Date(appointment.end.valueOf()),
	alarmData: appointment.resource.alarmData,
	location: appointment.resource.location,
	name: appointment.title,
	isOrg: appointment.resource.iAmOrganizer,
	id: appointment.resource.id,
	inviteId: appointment.resource.inviteId,
	calendar: appointment.resource.calendar,
	isException: appointment.resource.isException,
	allDay: appointment.allDay
});
