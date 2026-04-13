/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useState, useEffect, useMemo } from 'react';

import { FOLDERS, useFoldersMap, LinkFolder } from '@zextras/carbonio-ui-commons';
import { compact, filter, find, forEach, includes, isEmpty, map, reduce } from 'lodash';
import { addDays, differenceInSeconds, subDays } from 'date-fns';

import { ReminderModal } from './reminder-modal';
import sound from '../../assets/notification.mp3';
import { getTimeToDisplayData, isExternalSyncFolder } from '../../commons/utilities';
import { useCheckedCalendarsQuery } from '../../hooks/use-checked-calendars-query';
import { normalizeReminderItem } from '../../normalizations/normalize-reminder';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectAppointmentsArray, selectApptStatus } from '../../store/selectors/appointments';
import { useRangeEnd, useRangeStart } from '../../store/zustand/hooks';
import { ReminderItem, Reminders } from '../../types/appointment-reminder';
import { showNotification } from '../notifications';

export const AppointmentReminder = (): ReactElement | null => {
	const [reminders, setReminders] = useState<Reminders>({});
	const appointments = useAppSelector(selectAppointmentsArray);
	const status = useAppSelector(selectApptStatus);
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();

	const calendars = useFoldersMap();

	const alarms = useMemo(() => {
		const appts = filter(appointments, 'alarmData');
		return compact(
			map(appts, (appt) => {
				const isShared = appt?.l?.includes(':');
				const defaultCalendar = calendars?.['10'];
				const cal = isShared
					? find(calendars, (f) => `${(f as LinkFolder).zid}:${(f as LinkFolder).rid}` === appt.l)
					: find(calendars, (f) => f.id === appt.l);
				if (isExternalSyncFolder(cal ?? {})) {
					return undefined;
				}
				return normalizeReminderItem({ calendar: cal ?? defaultCalendar, appointment: appt });
			})
		);
	}, [appointments, calendars]);

	const notificationAudio = useMemo(() => new Audio(sound), []);

	const reminderRange = useMemo(
		() => ({
			start: subDays(new Date(), 7).getTime(),
			end: addDays(new Date(), 15).getTime()
		}),
		[]
	);

	const appointmentsToRemind = useMemo(
		() =>
			filter(
				alarms ?? [],
				(appt) =>
					appt?.alarmData?.length &&
					appt?.alarmData?.[0]?.nextAlarm &&
					(appt?.alarmData?.[0]?.nextAlarm ?? 0) >= (reminderRange?.start ?? 0) &&
					(appt?.alarmData?.[0]?.nextAlarm ?? 0) <= (reminderRange?.end ?? 0) &&
					!includes(appt?.inviteId, ':') &&
					appt?.calendar?.id !== FOLDERS.TRASH
			) as ReminderItem[],
		[alarms, reminderRange?.end, reminderRange?.start]
	);

	useEffect(() => {
		if (status === 'init' && !isEmpty(calendars)) {
			dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
		}
	}, [calendars, dispatch, end, query, start, status]);

	useEffect(() => {
		const interval = setInterval(() => {
			const remindersToNotify = [] as Array<ReminderItem>;
			const newValue = reduce(
				appointmentsToRemind,
				(acc, reminder) => {
					const difference = differenceInSeconds(
						new Date(reminder?.alarmData?.[0]?.nextAlarm ?? 0),
						new Date()
					);
					if (difference <= 0) {
						const isAlreadyAdded = find(reminders, {
							start: reminder.start,
							key: reminder.key,
							end: reminder.end
						});
						if (!isAlreadyAdded) {
							remindersToNotify.push(reminder);
						}
						return { ...acc, [reminder.key]: reminder };
					}
					return acc;
				},
				{}
			);
			setReminders(newValue);
			if (remindersToNotify?.length > 0) {
				notificationAudio.play();
				forEach(remindersToNotify, (rem) => {
					const { text } = getTimeToDisplayData(rem, Date.now());
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
