/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { ReminderItem } from '../types/appointment-reminder';
import { Appointment } from '../types/store/appointments';
import { Calendar } from '../types/store/calendars';

export const normalizeReminderItem = ({
	appointment,
	calendar
}: {
	appointment: Appointment;
	calendar: Calendar;
}): ReminderItem | undefined => {
	if (appointment.alarmData) {
		const user = getUserAccount();
		const iAmOrganizer =
			appointment?.or?.a && user?.name ? appointment?.or?.a === user?.name : false;
		return {
			start: new Date(appointment?.alarmData?.[0]?.alarmInstStart),
			key: `${appointment?.id}-${appointment?.alarmData?.[0]?.alarmInstStart}`,
			isRecurrent: appointment.recur,
			end: new Date(appointment.alarmData[0].alarmInstStart + appointment.dur),
			alarmData: appointment.alarmData,
			location: appointment.loc,
			name: appointment.name,
			isOrg: iAmOrganizer,
			id: appointment.id,
			inviteId: appointment.inviteId,
			calendar,
			isException: appointment.hasEx,
			allDay: appointment.allDay
		};
	}
	return undefined;
};
