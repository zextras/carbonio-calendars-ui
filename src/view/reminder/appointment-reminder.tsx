/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useState, useEffect, useMemo } from 'react';
import { filter, find, forEach, includes, isEmpty, map } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getTimeToDisplayData } from '../../commons/utilities';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { normalizeReminderItem } from '../../normalizations/normalize-reminder';
import { selectAppointmentsArray } from '../../store/selectors/appointments';
import { selectCalendars } from '../../store/selectors/calendars';
import { ReminderItem, Reminders } from '../../types/appointment-reminder';
import { EventType } from '../../types/event';
import { showNotification } from '../notifications';
import { ReminderModal } from './reminder-modal';
import sound from '../../assets/notification.mp3';

export const AppointmentReminder = (): ReactElement | null => {
	const [reminders, setReminders] = useState<Reminders>({});
	const appointments = useSelector(selectAppointmentsArray);
	const calendars = useSelector(selectCalendars);

	const events = map(appointments, (appt) => {
		const isShared = appt?.l?.includes(':');
		const cal = isShared
			? find(calendars, (f) => `${f.zid}:${f.rid}` === appt.l)
			: find(calendars, (f) => f.id === appt.l);
		return normalizeCalendarEvent({ calendar: cal ?? calendars?.['10'], appointment: appt });
	});

	const notificationAudio = useMemo(() => new Audio(sound), []);

	const reminderRange = useMemo(
		() => ({
			start: moment().subtract('7', 'days').valueOf(),
			end: moment().add('15', 'days').valueOf()
		}),
		[]
	);

	const appointmentsToRemind = useMemo(
		() =>
			filter(
				events ?? [],
				(appt) =>
					appt?.resource?.alarm &&
					appt?.resource?.alarmData?.length &&
					appt?.resource?.alarmData?.[0]?.nextAlarm > reminderRange?.start &&
					moment(appt?.resource?.alarmData?.[0]?.nextAlarm).isSameOrAfter(
						moment(reminderRange?.start)
					) &&
					moment(appt?.resource?.alarmData?.[0]?.nextAlarm).isSameOrBefore(
						moment(reminderRange?.end)
					) &&
					!includes(appt?.resource?.inviteId, ':') &&
					appt?.resource?.calendar?.id !== FOLDERS.TRASH
			) as EventType[],
		[events, reminderRange?.end, reminderRange?.start]
	);

	useEffect(() => {
		const interval = setInterval(() => {
			const remindersToNotify = [] as Array<ReminderItem>;
			forEach(appointmentsToRemind, (appt) => {
				const difference = moment(appt?.resource?.alarmData?.[0]?.nextAlarm).diff(
					moment(),
					'seconds',
					true
				);
				if (difference <= 0) {
					const reminder = normalizeReminderItem(appt);
					const isAlreadyAdded = find(reminders, {
						start: reminder.start,
						key: reminder.key,
						end: reminder.end
					});
					if (!isAlreadyAdded) {
						remindersToNotify.push(reminder);
						setReminders((rem) => ({
							...rem,
							[reminder.key]: reminder
						}));
					}
				}
			});
			if (remindersToNotify?.length > 0) {
				notificationAudio.play();
				forEach(remindersToNotify, (rem) => {
					const { text } = getTimeToDisplayData(rem, moment());
					showNotification(rem?.name, text);
				});
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [appointmentsToRemind, notificationAudio, reminders]);

	return !isEmpty(reminders) ? (
		<ReminderModal reminders={reminders} setReminders={setReminders} />
	) : null;
};
