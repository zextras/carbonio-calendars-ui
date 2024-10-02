/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { Row, Text } from '@zextras/carbonio-design-system';
import { find, isEmpty, minBy, map } from 'lodash';
import moment from 'moment-timezone';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useParams } from 'react-router-dom';
import { ThemeContext } from 'styled-components';

import CalendarStyle from './calendar-style';
import { MemoCustomEvent } from './custom-event';
import CustomEventWrapper from './custom-event-wrapper';
import { CustomToolbar } from './custom-toolbar';
import { WorkView } from './work-view';
import { usePrefs } from '../../carbonio-ui-commons/utils/use-prefs';
import { useCalendarComponentUtils } from '../../hooks/use-calendar-component-utils';
import { useCheckedCalendarsQuery } from '../../hooks/use-checked-calendars-query';
import { useCheckedFolders } from '../../hooks/use-checked-folders';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectAppointmentsArray } from '../../store/selectors/appointments';
import {
	useCalendarView,
	useIsSummaryViewOpen,
	useRangeEnd,
	useRangeStart
} from '../../store/zustand/hooks';
import { isOrganizerOrHaveEqualRights } from '../../utils/store/event';
import { workWeek } from '../../utils/work-week';

const BigCalendar = withDragAndDrop(Calendar);

const views = { month: true, week: true, day: true, work_week: WorkView };

const MULTI_CALENDARS_COLUMN_MIN_WIDTH = '16.75rem';

const CalendarSyncWithRange = () => {
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();

	useEffect(() => {
		dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
	}, [dispatch, end, query, start]);
	return null;
};

const MyResourceHeader = (props) => {
	const backgroundColor = setCalendarColor({
		color: props.resource.color
	});
	return (
		<Row
			key={props.id}
			background={backgroundColor.background}
			borderColor={backgroundColor.color}
			height="2.25rem"
			padding={'small'}
		>
			<Text weight={'bold'}>{props.label}</Text>
		</Row>
	);
};
const customComponents = {
	toolbar: CustomToolbar,
	event: MemoCustomEvent,
	eventWrapper: CustomEventWrapper,
	resourceHeader: MyResourceHeader
};

export default function CalendarComponent() {
	const appointments = useAppSelector(selectAppointmentsArray);
	const calendars = useCheckedFolders();
	const theme = useContext(ThemeContext);
	const prefs = usePrefs();
	const calendarView = useCalendarView();
	const summaryViewOpen = useIsSummaryViewOpen();
	const firstDayOfWeek = prefs.zimbraPrefCalendarFirstDayOfWeek ?? 0;
	const localizer = momentLocalizer(moment);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);
	const { action } = useParams();

	const { onEventDropOrResize, handleSelect, onRangeChange, onNavigate, date } =
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
		() => normalizeCalendarEvents(appointments, calendars),
		[appointments, calendars]
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
			const dayOfTheWeek = newDate.getDay();
			const hourSlot =
				String(newDate.getHours()).padStart(2, '0') + String(newDate.getMinutes()).padStart(2, '0');

			if (workingSchedule?.[dayOfTheWeek]?.working) {
				if (
					hourSlot >= workingSchedule[dayOfTheWeek].start &&
					hourSlot < workingSchedule[dayOfTheWeek].end
				) {
					return theme.palette.gray6.regular;
				}
				return theme.palette.gray5.regular;
			}
			return theme.palette.gray5.regular;
		},
		[theme?.palette?.gray5?.regular, theme?.palette?.gray6?.regular, workingSchedule]
	);

	const slotDayBorderColor = useCallback(
		(newDate) => {
			const dayOfTheWeek = newDate.getDay();

			if (workingSchedule?.[dayOfTheWeek]?.working) {
				return theme.palette.gray3.regular;
			}
			return theme.palette.gray6.regular;
		},
		[theme?.palette?.gray3?.regular, theme?.palette?.gray6?.regular, workingSchedule]
	);

	const eventPropGetter = useCallback(
		(event) => ({
			style: {
				backgroundColor: event.resource.calendar.color.background,
				color: event.resource.calendar.color.color,
				border: `0.0625rem solid ${event.resource.calendar.color.color}`,
				padding: 0
			}
		}),
		[]
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

	const columnMinWidth = useMemo(() => {
		if (calendarView === 'day') {
			return MULTI_CALENDARS_COLUMN_MIN_WIDTH;
		}
		return undefined;
	}, [calendarView]);

	const dayPropGetter = useCallback(
		(newDate) => ({
			style: {
				minWidth: columnMinWidth,
				backgroundColor:
					// eslint-disable-next-line no-nested-ternary
					workingSchedule?.[newDate.getDay()]?.working
						? new Date().getDay() === newDate.getDay()
							? theme.palette.highlight.regular
							: theme.palette.gray6.regular
						: theme.palette.gray3.regular,
				borderBottom: `0.0625rem solid ${slotDayBorderColor(newDate)}`
			}
		}),
		[
			columnMinWidth,
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

	const draggableAccessor = useCallback(
		(calendarEvent) => {
			if (calendarEvent) {
				const absFolderPath = find(calendars, [
					'id',
					calendarEvent.resource.calendar.id
				])?.absFolderPath;
				return isOrganizerOrHaveEqualRights(calendarEvent, absFolderPath);
			}
			return false;
		},
		[calendars]
	);

	const resizableAccessor = useCallback(
		(calendarEvent) => {
			if (calendarEvent) {
				const absFolderPath = find(calendars, [
					'id',
					calendarEvent.resource.calendar.id
				])?.absFolderPath;
				return (
					isOrganizerOrHaveEqualRights(calendarEvent, absFolderPath) &&
					// disabling every appointment placed in the all day position until a bug is fixed:
					// https://github.com/jquense/react-big-calendar/issues/2432
					(!calendarEvent.allDay ||
						(!calendarEvent.allDay &&
							new Date(calendarEvent.start).getDay() === new Date(calendarEvent.end).getDay()))
				);
			}
			return false;
		},
		[calendars]
	);

	const scrollToTime = useMemo(() => new Date(0, 0, 0, startHour, -15, 0), [startHour]);
	const resources = useMemo(() => {
		if (calendarView === 'day' || calendarView === 'month') {
			return map(calendars, (c) => ({ id: c.id, title: c.name, color: c.color }));
		}
		return undefined;
	}, [calendarView, calendars]);

	return (
		<>
			{!isEmpty(calendars) && <CalendarSyncWithRange />}
			<CalendarStyle
				primaryCalendar={primaryCalendar}
				summaryViewOpen={summaryViewOpen}
				action={action}
				headerMinWidth={columnMinWidth}
			/>
			<BigCalendar
				selectable
				localizer={localizer}
				defaultView={defaultView}
				events={events}
				resources={resources}
				date={date}
				onNavigate={onNavigate}
				startAccessor="start"
				endAccessor="end"
				style={{ minWidth: '100%' }}
				components={customComponents}
				views={views}
				tooltipAccessor={null}
				onRangeChange={onRangeChange}
				dayPropGetter={dayPropGetter}
				slotPropGetter={slotPropGetter}
				eventPropGetter={eventPropGetter}
				workingSchedule={workingSchedule}
				onSelectSlot={handleSelect}
				scrollToTime={scrollToTime}
				onEventDrop={onEventDropOrResize}
				onEventResize={onEventDropOrResize}
				formats={{ eventTimeRangeFormat: () => '' }}
				resizable
				resizableAccessor={resizableAccessor}
				onSelecting={() => !summaryViewOpen && !action}
				draggableAccessor={draggableAccessor}
			/>
		</>
	);
}
