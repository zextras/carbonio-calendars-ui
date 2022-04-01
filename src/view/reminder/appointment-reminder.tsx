/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, useAddBoardCallback, useUpdateCurrentBoard } from '@zextras/carbonio-shell-ui';
/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { FC, ReactElement, useCallback, useState, useEffect, useMemo } from 'react';
import { CustomModal } from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
	reduce,
	values,
	uniq,
	uniqBy,
	pullAll,
	isEmpty,
	map,
	forEach,
	differenceWith,
	lastIndexOf
} from 'lodash';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { dismissApptReminder } from '../../store/actions/dismiss-appointment-reminder';
import { setSearchRange } from '../../store/actions/set-search-range';
import { selectAllAppointments, selectApptStatus } from '../../store/selectors/appointments';
import { selectCalendars } from '../../store/selectors/calendars';
import { AppointmentReminderProps, EventType } from '../../types/appointment-reminder';
import SetNewTimeModal from './set-new_time-modal';
// @ts-ignore
import sound from '../../assets/notification.mp3';
import ApptReminderModal from './appt-reminder-modal';
import { showNotification } from '../notifications';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from '../../constants';

const AppointmentReminder: FC<AppointmentReminderProps> = (): ReactElement => {
	const dispatch = useDispatch();
	const [t] = useTranslation();

	const [playing, setPlaying] = useState(false);
	const [apptForReminders, setApptForReminders] = useState<Array<EventType>>([]);
	const [reminderQueue, setReminderQueue] = useState<Record<string, () => void>>({});
	const [showNewTimeModal, setShowNewTimeModal] = useState(false);
	const [audio] = useState(new Audio(sound));
	const [eventForChange, setEventForChange] = useState<EventType>();

	const appointments = useSelector(selectAllAppointments);
	const calendars = useSelector(selectCalendars);
	const status = useSelector(selectApptStatus);
	const reminderRange = useMemo(
		() => ({
			start: moment().subtract('7', 'days').valueOf(),
			end: moment().add('15', 'days').valueOf()
		}),
		[]
	);

	const updateBoard = useUpdateCurrentBoard();
	const addBoard = useAddBoardCallback();

	useEffect(() => {
		playing ? audio.play() : audio.pause();
	}, [playing, audio]);

	useEffect(() => {
		const handler = () => setPlaying(false);
		audio.addEventListener('ended', () => handler);
		return () => {
			audio.removeEventListener('ended', () => handler);
		};
	}, [audio]);

	const events = useMemo(
		() => normalizeCalendarEvents(values(appointments), calendars),
		[appointments, calendars]
	);

	const eventsToRemind = useMemo(
		() =>
			reduce(
				events,
				(acc: Array<EventType>, val: EventType) => {
					if (
						val?.resource.alarm &&
						val?.resource.alarmData?.[0]?.nextAlarm > reminderRange.start &&
						val?.permission === true &&
						val?.resource?.calendar?.id !== FOLDERS.TRASH
					) {
						if (
							moment(val.resource.alarmData[0].nextAlarm).isSameOrAfter(
								moment(reminderRange.start)
							) &&
							moment(val.resource.alarmData[0].nextAlarm).isSameOrBefore(moment(reminderRange.end))
						) {
							acc.push(val);
						}
					}
					return acc;
				},
				[]
			),
		[events, reminderRange.end, reminderRange.start]
	);

	useEffect(() => {
		const tmp: Record<string, () => void> = {};
		const tp = differenceWith(apptForReminders, eventsToRemind);
		const uniqueTp = uniq(tp);
		const trans = pullAll(apptForReminders, uniqueTp);
		setApptForReminders(trans);

		// @ts-ignore
		map(reminderQueue, (q) => clearTimeout(q));
		map(eventsToRemind, (rem: EventType) => {
			const { alarmData, fragment, inviteId } = rem.resource;
			const now = moment();
			const difference = moment(alarmData[0].nextAlarm).diff(now, 'seconds', true);
			const index = lastIndexOf(apptForReminders, rem);

			if (index === -1) {
				tmp[`${inviteId}`] = () =>
					setTimeout(
						() => {
							showNotification(rem.title, fragment);
							setPlaying(true);
							setApptForReminders((prevApp) => [...prevApp, rem]);
						},
						difference <= 0 ? 1000 : difference * 1000
					);
			}
		});
		setReminderQueue(tmp);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventsToRemind]);

	useEffect(() => {
		forEach(reminderQueue, (q) => q());
	}, [reminderQueue]);

	useEffect(() => {
		if (!isEmpty(calendars) && status === 'init') {
			const now = moment();
			dispatch(
				setSearchRange({
					rangeStart: now.subtract('7', 'days').valueOf(),
					rangeEnd: now.add('15', 'days').valueOf()
				})
			);
		}
	}, [dispatch, status, calendars]);

	const uniqueReminders = useMemo(
		() => (apptForReminders.length > 0 ? uniqBy(apptForReminders, 'resource.uid') : []),
		[apptForReminders]
	);
	const dismissAll = useCallback(() => {
		const dismissItems = map(uniqueReminders, (a: EventType) => ({
			id: a.resource.id,
			dismissedAt: moment().valueOf()
		}));
		setShowNewTimeModal(false);
		if (dismissItems.length > 0) {
			// @ts-ignore
			dispatch(dismissApptReminder({ dismissItems }));
			setApptForReminders([]);
		}
	}, [dispatch, uniqueReminders]);

	const removeFromAppList = useCallback(
		(id) => {
			const tmp = apptForReminders.filter((apt: EventType) => apt.resource.id !== id);
			setApptForReminders(tmp);
		},
		[apptForReminders]
	);

	const toggleModal = useCallback(() => setShowNewTimeModal(!showNewTimeModal), [showNewTimeModal]);

	const setNewTime = useCallback(() => {
		addBoard(`${CALENDAR_ROUTE}/edit?edit=${eventForChange?.resource?.id}&updateTime=true`, {
			app: CALENDAR_APP_ID,
			// Addboard call needs to be typed better
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			event: eventForChange
		});
		// @ts-ignore
		updateBoard(undefined, eventForChange?.title || 'Set New Time');
		dismissAll();
	}, [eventForChange, addBoard, updateBoard, dismissAll]);

	const openReminder = useMemo(
		() => uniqueReminders.length > 0 && apptForReminders.length > 0,
		[uniqueReminders, apptForReminders]
	);

	return (
		<>
			<CustomModal
				open={openReminder}
				onClose={() => null}
				maxHeight="90vh"
				// @ts-ignore
				onClick={(e) => e.stopPropagation()}
				// @ts-ignore
				onDoubleClick={(e) => e.stopPropagation()}
			>
				{showNewTimeModal ? (
					<SetNewTimeModal toggleModal={toggleModal} t={t} setNewTime={setNewTime} />
				) : (
					<ApptReminderModal
						title="Appointment Reminder"
						onClose={() => null}
						events={uniqueReminders || []}
						open={uniqueReminders.length > 0}
						t={t}
						toggleModal={toggleModal}
						dispatch={dispatch}
						onConfirm={dismissAll}
						setActive={setEventForChange}
						removeReminder={removeFromAppList}
					/>
				)}
			</CustomModal>
		</>
	);
};

export default AppointmentReminder;
