/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { ThemeContext } from 'styled-components';
import { FOLDERS, getBridgedFunctions, store, useUserSettings } from '@zextras/carbonio-shell-ui';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useDispatch, useSelector } from 'react-redux';
import { isEqual, minBy } from 'lodash';
import { min as datesMin, max as datesMax } from 'date-arithmetic';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useTranslation } from 'react-i18next';
import { CustomEvent } from './custom-event';
import CustomEventWrapper from './custom-event-wrapper';
import { CustomToolbar } from './custom-toolbar';
import { WorkView } from './work-view';
import { workWeek } from '../../utils/work-week';
import {
	selectCalendars,
	selectCheckedCalendarsMap,
	selectEnd,
	selectStart
} from '../../store/selectors/calendars';
import { selectAppointmentsArray } from '../../store/selectors/appointments';
import { setRange } from '../../store/slices/calendars-slice';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { useCalendarDate, useCalendarView, useIsSummaryViewOpen } from '../../store/zustand/hooks';
import { useAppStatusStore } from '../../store/zustand/store';
import { searchAppointments } from '../../store/actions/search-appointments';
import { generateEditor, getEndTime } from '../../commons/editor-generator';
import { CALENDAR_ROUTE } from '../../constants';
import { getInvite } from '../../store/actions/get-invite';
import CalendarStyle from './calendar-style';

const nullAccessor = () => null;
const BigCalendar = withDragAndDrop(Calendar);

const views = { month: true, week: true, day: true, work_week: WorkView };

const CalendarSyncWithRange = () => {
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
	}, [dispatch, end, start]);
	return null;
};

const customComponents = {
	toolbar: CustomToolbar,
	event: (props) => <CustomEvent {...props} />,
	eventWrapper: CustomEventWrapper
};

export default function CalendarComponent() {
	const appointments = useSelector(selectAppointmentsArray);
	const selectedCalendars = useSelector(selectCheckedCalendarsMap);
	const dispatch = useDispatch();
	const theme = useContext(ThemeContext);
	const settings = useUserSettings();
	const [t] = useTranslation();
	const calendarView = useCalendarView();
	const calendarDate = useCalendarDate();
	const timeZone = settings.prefs.zimbraPrefTimeZoneId;
	const summaryViewOpen = useIsSummaryViewOpen();
	const firstDayOfWeek = settings.prefs.zimbraPrefCalendarFirstDayOfWeek ?? 0;
	const localizer = momentLocalizer(moment);
	const [date, setDate] = useState(calendarDate);
	const calendars = useSelector(selectCalendars);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);

	if (settings.prefs.zimbraPrefLocale) {
		moment.updateLocale(settings.prefs.zimbraPrefLocale, {
			week: {
				dow: firstDayOfWeek
			}
		});
	}
	const workingSchedule = useMemo(() => workWeek(settings), [settings]);

	const events = useMemo(
		() => normalizeCalendarEvents(appointments, selectedCalendars),
		[appointments, selectedCalendars]
	);
	const startHour = useMemo(
		() =>
			Number(
				minBy(workingSchedule, (w) => w?.start)
					?.start?.split('')
					.splice(0, 2)
					.join('')
			),
		[workingSchedule]
	);

	const slotBgColor = (newDate) => {
		if (workingSchedule?.[moment(newDate).day()]?.working) {
			if (
				moment(newDate).tz(timeZone).format('HHmm') >=
					workingSchedule[moment(newDate).day()].start &&
				moment(newDate).tz(timeZone).format('HHmm') < workingSchedule[moment(newDate).day()].end
			) {
				return theme.palette.gray6.regular;
			}
			return theme.palette.gray5.regular;
		}
		return theme.palette.gray5.regular;
	};

	const slotDayBorderColor = (newDate) => {
		if (workingSchedule?.[moment(newDate).day()]?.working) {
			return theme.palette.gray3.regular;
		}
		return theme.palette.gray6.regular;
	};

	const slotPropGetter = (newDate) => ({
		style: {
			backgroundColor: slotBgColor(newDate),
			borderColor: `${theme.palette.gray3.regular}`,
			borderRight: `1px solid ${theme.palette.gray3.regular}`
		}
	});
	const dayPropGetter = (newDate) => ({
		style: {
			backgroundColor:
				// eslint-disable-next-line no-nested-ternary
				workingSchedule?.[moment(newDate).day()]?.working
					? moment().isSame(moment(newDate), 'day')
						? theme.palette.highlight.regular
						: theme.palette.gray6.regular
					: theme.palette.gray3.regular,
			borderBottom: `1px solid ${slotDayBorderColor(newDate)}`
		}
	});

	const onRangeChange = useCallback(
		(range) => {
			if (range.length) {
				const min = datesMin(...range);
				const max = datesMax(...range);
				dispatch(
					setRange({
						start: moment(min).startOf('day').valueOf(),
						end: moment(max).endOf('day').valueOf()
					})
				);
			} else {
				dispatch(
					setRange({
						start: moment(range.start).startOf('day').valueOf(),
						end: moment(range.end).endOf('day').valueOf()
					})
				);
			}
		},
		[dispatch]
	);

	const defaultView = useMemo(() => {
		if (calendarView) {
			return calendarView;
		}
		switch (settings.prefs.zimbraPrefCalendarInitialView) {
			case 'month':
				return 'month';
			case 'week':
				return 'week';
			case 'day':
				return 'day';
			default:
				return 'work_week';
		}
	}, [calendarView, settings?.prefs?.zimbraPrefCalendarInitialView]);

	const handleSelect = useCallback(
		(e) => {
			if (!summaryViewOpen) {
				const isAllDay =
					moment(e.end).hours() === moment(e.start).hours() &&
					moment(e.end).minutes() === moment(e.start).minutes() &&
					!moment(e.start).isSame(moment(e.end));
				const slotEnd = moment(e.end);
				const preferredSettingsEnd = moment(
					getEndTime({
						start: moment(e.start).valueOf(),
						duration: settings?.prefs?.zimbraPrefCalendarDefaultApptDuration
					})
				);
				const end = slotEnd.isSameOrAfter(preferredSettingsEnd) ? slotEnd : preferredSettingsEnd;
				const editorEnd = isAllDay ? slotEnd : end;
				const { editor, callbacks } = generateEditor({
					context: {
						title: t('label.new_appointment', 'New Appointment'),
						start: moment(e.start).valueOf(),
						end: editorEnd,
						allDay: isAllDay ?? false,
						panel: false
					}
				});
				const storeData = store.store.getState();
				getBridgedFunctions().addBoard(`${CALENDAR_ROUTE}/`, {
					...storeData.editor.editors[editor.id],
					callbacks
				});
			}
			useAppStatusStore.setState((s) => ({ ...s, isSummaryViewOpen: false }));
		},
		[settings?.prefs?.zimbraPrefCalendarDefaultApptDuration, summaryViewOpen, t]
	);

	const onEventDrop = useCallback(
		(appt) => {
			const { start, end, event, isAllDay } = appt;
			if (!isEqual(event.start, start) || !isEqual(event.end, end) || event.allDay !== !!isAllDay) {
				dispatch(getInvite({ inviteId: event.resource.inviteId, ridZ: event.resource.ridZ })).then(
					({ payload }) => {
						const startTime = isAllDay ? moment(start).startOf('day') : moment(start).valueOf();
						const endTime =
							isAllDay || event.allDay ? moment(start).endOf('day') : moment(end).valueOf();
						const invite = normalizeInvite(payload.m);
						const { editor, callbacks } = generateEditor({
							event,
							invite,
							context: {
								start: startTime,
								end: endTime,
								allDay: !!isAllDay
							}
						});
						const storeData = store.store.getState();
						callbacks
							.onSave({
								isNew: storeData.editor.editors[editor.id]?.isNew
							})
							.then((res) => {
								if (res?.type) {
									const success = res.type.includes('fulfilled');
									getBridgedFunctions().createSnackbar({
										key: `calendar-moved-root`,
										replace: true,
										type: success ? 'info' : 'warning',
										hideButton: true,
										label: !success
											? t('label.error_try_again', 'Something went wrong, please try again')
											: t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
										autoHideTimeout: 3000
									});
								}
							});
					}
				);
			}
		},
		[dispatch, t]
	);

	const eventPropGetter = useCallback(
		(event) => ({
			style: {
				backgroundColor: event.resource.calendar.color.background,
				color: event.resource.calendar.color.color,
				boxSizing: 'border-box',
				margin: `0`,
				padding: `4px 8px`,
				borderRadius: `4px`,
				cursor: `pointer`,
				width: `100%`,
				textAlign: `left`,
				transition: `border 0.15s ease-in-out, background 0.15s ease-in-out`,
				boxShadow: `0px 0px 14px -8px rgba(0, 0, 0, 0.5)`,
				border: `1px solid ${event.resource.calendar.color.color}`
			}
		}),
		[]
	);

	const onNavigate = useCallback(
		(newDate) => {
			useAppStatusStore.setState((s) => ({ ...s, date: newDate }));
			return setDate(newDate);
		},
		[setDate]
	);

	const resizeEvent = useCallback(({ event, start, end }) => {
		console.log(event, start, end);
	}, []);

	return (
		<>
			<CalendarSyncWithRange />
			<CalendarStyle primaryCalendar={primaryCalendar} />
			<BigCalendar
				selectable
				eventPropGetter={eventPropGetter}
				localizer={localizer}
				defaultView={defaultView}
				events={events}
				date={date}
				onNavigate={onNavigate}
				startAccessor="start"
				endAccessor="end"
				style={{ width: '100%' }}
				components={customComponents}
				views={views}
				tooltipAccessor={nullAccessor}
				onRangeChange={onRangeChange}
				dayPropGetter={dayPropGetter}
				slotPropGetter={slotPropGetter}
				workingSchedule={workingSchedule}
				onSelectSlot={handleSelect}
				scrollToTime={new Date(0, 0, 0, startHour, -15, 0)}
				onEventDrop={onEventDrop}
				onEventResize={resizeEvent}
				formats={{ eventTimeRangeFormat: () => '' }}
				resizable
				resizableAccessor={() => false}
				draggableAccessor={(event) =>
					event.resource.iAmOrganizer && event.resource.calendar.id !== FOLDERS.TRASH
				}
			/>
		</>
	);
}
