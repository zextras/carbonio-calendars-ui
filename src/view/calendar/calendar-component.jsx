/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, forEach, isEmpty, minBy } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useParams } from 'react-router-dom';
import { ThemeContext } from 'styled-components';
import moment from 'moment-timezone';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { searchAppointments } from '../../store/actions/search-appointments';
import { selectAppointmentsArray } from '../../store/selectors/appointments';
import {
	useCalendarView,
	useIsSummaryViewOpen,
	useRangeEnd,
	useRangeStart
} from '../../store/zustand/hooks';
import { workWeek } from '../../utils/work-week';
import CalendarStyle from './calendar-style';
import { MemoCustomEvent } from './custom-event';
import { CustomToolbar } from './custom-toolbar';
import { WorkView } from './work-view';
import { usePrefs } from '../../carbonio-ui-commons/utils/use-prefs';
import { useCalendarComponentUtils } from '../../hooks/use-calendar-component-utils';
import CustomEventWrapper from './custom-event-wrapper';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { getUpdateFolder, useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import { useCheckedFolders } from '../../hooks/use-checked-folders';
import { getMiniCal } from '../../store/actions/get-mini-cal';

const nullAccessor = () => null;
const BigCalendar = withDragAndDrop(Calendar);

const views = { month: true, week: true, day: true, work_week: WorkView };

const CalendarSyncWithRange = () => {
	const [currentChecked, setCurrentChecked] = useState(0);
	const checked = useCheckedFolders();
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();

	useEffect(() => {
		if (checked?.length) {
			setCurrentChecked(checked?.length);
			if (checked?.length > currentChecked) {
				dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
				dispatch(getMiniCal({ start, end })).then((response) => {
					const updateFolder = getUpdateFolder();
					if (response?.payload?.error) {
						forEach(response?.payload?.error, ({ id }) => {
							updateFolder(id, { broken: true });
						});
					}
				});
			}
		}
	}, [checked?.length, currentChecked, dispatch, end, start]);
	return null;
};

const customComponents = {
	toolbar: CustomToolbar,
	event: (props) => <MemoCustomEvent {...props} />,
	eventWrapper: CustomEventWrapper
};

export default function CalendarComponent() {
	const appointments = useAppSelector(selectAppointmentsArray);
	const calendars = useFoldersMap();
	const selectedCalendars = filter(calendars, ['checked', true]);
	const theme = useContext(ThemeContext);
	const prefs = usePrefs();
	const calendarView = useCalendarView();
	const timeZone = prefs.zimbraPrefTimeZoneId;
	const summaryViewOpen = useIsSummaryViewOpen();
	const firstDayOfWeek = prefs.zimbraPrefCalendarFirstDayOfWeek ?? 0;
	const localizer = momentLocalizer(moment);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);
	const { action } = useParams();

	const { onEventDrop, handleSelect, resizeEvent, onRangeChange, onNavigate, date } =
		useCalendarComponentUtils();

	if (prefs.zimbraPrefLocale) {
		moment.updateLocale(prefs.zimbraPrefLocale, {
			week: {
				dow: firstDayOfWeek
			}
		});
	}

	const workingSchedule = useMemo(
		() => workWeek(prefs.zimbraPrefCalendarWorkingHours),
		[prefs?.zimbraPrefCalendarWorkingHours]
	);

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

	const selectSlotBgColor = useCallback(
		(newDate) => {
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
		},
		[theme?.palette?.gray5?.regular, theme?.palette?.gray6?.regular, timeZone, workingSchedule]
	);

	const slotDayBorderColor = useCallback(
		(newDate) => {
			if (workingSchedule?.[moment(newDate).day()]?.working) {
				return theme.palette.gray3.regular;
			}
			return theme.palette.gray6.regular;
		},
		[theme?.palette?.gray3?.regular, theme?.palette?.gray6?.regular, workingSchedule]
	);

	const slotPropGetter = useCallback(
		(newDate) => ({
			style: {
				backgroundColor: selectSlotBgColor(newDate),
				borderColor: `${theme.palette.gray3.regular}`,
				borderRight: `0.0625rem solid ${theme.palette.gray3.regular}`
			}
		}),
		[selectSlotBgColor, theme?.palette?.gray3?.regular]
	);

	const dayPropGetter = useCallback(
		(newDate) => ({
			style: {
				backgroundColor:
					// eslint-disable-next-line no-nested-ternary
					workingSchedule?.[moment(newDate).day()]?.working
						? moment().isSame(moment(newDate), 'day')
							? theme.palette.highlight.regular
							: theme.palette.gray6.regular
						: theme.palette.gray3.regular,
				borderBottom: `0.0625rem solid ${slotDayBorderColor(newDate)}`
			}
		}),
		[
			slotDayBorderColor,
			theme.palette.gray3.regular,
			theme.palette.gray6.regular,
			theme.palette.highlight.regular,
			workingSchedule
		]
	);

	const defaultView = useMemo(() => {
		if (calendarView) {
			return calendarView;
		}
		switch (prefs.zimbraPrefCalendarInitialView) {
			case 'month':
				return 'month';
			case 'week':
				return 'week';
			case 'day':
				return 'day';
			default:
				return 'work_week';
		}
	}, [calendarView, prefs?.zimbraPrefCalendarInitialView]);

	return (
		<>
			{!isEmpty(calendars) && <CalendarSyncWithRange />}
			<CalendarStyle
				primaryCalendar={primaryCalendar}
				summaryViewOpen={summaryViewOpen}
				action={action}
			/>
			<BigCalendar
				selectable
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
				onSelecting={() => !summaryViewOpen && !action}
				draggableAccessor={(event) =>
					event.resource.iAmOrganizer && event.resource.calendar.id !== FOLDERS.TRASH
				}
			/>
		</>
	);
}
