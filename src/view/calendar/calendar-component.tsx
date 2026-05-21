/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo } from 'react';

import { Popover, useTheme } from '@zextras/carbonio-design-system';
import { usePrefs, isTrashOrNestedInIt } from '@zextras/carbonio-ui-commons';
import { filter, find, isEmpty, map, minBy } from 'lodash';
import moment from 'moment-timezone';
import { Calendar, type Components, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useParams } from 'react-router-dom';

import { CalendarResource, CalendarResourceHeader } from './calendar-resource-header';
import CalendarStyle from './calendar-style';
import { MemoCustomEvent } from './custom-event';
import { CustomShowMoreButton } from './custom-show-more-button';
import { CustomToolbar } from './custom-toolbar';
import { WorkView } from './work-view';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { EVENT_ACTIONS } from '../../constants/event-actions';
import { useCalendarComponentUtils } from '../../hooks/use-calendar-component-utils';
import { useCheckedCalendarsQuery } from '../../hooks/use-checked-calendars-query';
import { useCheckedFolders } from '../../hooks/use-checked-folders';
import { useSplitLayoutPrefs } from '../../hooks/use-split-layout-prefs';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectAppointmentsArray } from '../../store/selectors/appointments';
import {
	useSummaryViewRef,
	useCalendarView,
	useIsSummaryViewOpen,
	useRangeEnd,
	useRangeStart
} from '../../store/zustand/hooks';
import { useAppStatusStore } from '../../store/zustand/store';
import { EventType } from '../../types/event';
import { isOrganizerOrHaveEqualRights } from '../../utils/store/event';
import { WorkWeekDay, workWeek } from '../../utils/work-week';
import EventPanelView from '../event-panel-view/event-panel-view';
import { MemoEventSummaryView } from '../event-summary-view/event-summary-view';

const _BigCalendar = withDragAndDrop<EventType, CalendarResource>(Calendar);
// `workingSchedule` is a custom prop consumed by the WorkView component, not part of the library's types
const BigCalendar = _BigCalendar as React.ComponentType<
	React.ComponentProps<typeof _BigCalendar> & { workingSchedule?: WorkWeekDay[] }
>;

const views = { month: true, week: true, day: true, work_week: WorkView };

const MULTI_CALENDARS_COLUMN_MIN_WIDTH = '16.75rem';

const CalendarSyncWithRange = (): null => {
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();

	useEffect(() => {
		dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
	}, [dispatch, end, query, start]);
	return null;
};

const customComponents: Components<EventType, CalendarResource> | undefined = {
	toolbar: CustomToolbar,
	event: MemoCustomEvent,
	resourceHeader: CalendarResourceHeader,
	showMore: CustomShowMoreButton
};

export default function CalendarComponent(): React.JSX.Element {
	const appointments = useAppSelector(selectAppointmentsArray);
	const calendars = useCheckedFolders();
	const theme = useTheme();
	const prefs = usePrefs();
	const calendarView = useCalendarView();
	const summaryViewOpen = useIsSummaryViewOpen();
	const anchorElement = useSummaryViewRef();
	const firstDayOfWeek = (prefs.zimbraPrefCalendarFirstDayOfWeek as unknown as number) ?? 0;
	const localizer = momentLocalizer(moment);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);
	const { action } = useParams();

	const [isSplitLayoutEnabled] = useSplitLayoutPrefs();
	const { onEventDropOrResize, handleSelect, onRangeChange, onNavigate, date } =
		useCalendarComponentUtils();

	if (prefs.zimbraPrefLocale) {
		moment.updateLocale(prefs.zimbraPrefLocale, {
			week: {
				dow: firstDayOfWeek
			}
		});
	}

	const workingSchedule = useMemo<WorkWeekDay[]>(
		() => workWeek(String(prefs.zimbraPrefCalendarWorkingHours ?? '')),
		[prefs?.zimbraPrefCalendarWorkingHours]
	);

	/**
	 * Memoized list of calendar events, filtered by declined meetings preference.
	 *
	 * @description List of normalized calendar events, with declined meetings removed if preference is set to FALSE.
	 */
	const events = useMemo<Array<EventType>>(() => {
		const eventsList = normalizeCalendarEvents(appointments, calendars);
		if (prefs.zimbraPrefCalendarShowDeclinedMeetings === 'TRUE') return eventsList;
		return filter(
			eventsList,
			(event) => event.resource.participationStatus !== PARTICIPATION_STATUS.DECLINED
		);
	}, [appointments, calendars, prefs.zimbraPrefCalendarShowDeclinedMeetings]);

	const startHour = useMemo<number>(
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
		(newDate: Date): string => {
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
		(newDate: Date): string => {
			const dayOfTheWeek = newDate.getDay();

			if (workingSchedule?.[dayOfTheWeek]?.working) {
				return theme.palette.gray3.regular;
			}
			return theme.palette.gray6.regular;
		},
		[theme?.palette?.gray3?.regular, theme?.palette?.gray6?.regular, workingSchedule]
	);

	const slotPropGetter = useCallback(
		(newDate: Date): { style: React.CSSProperties } => ({
			style: {
				backgroundColor: selectSlotBgColor(newDate),
				borderColor: `${theme.palette.gray3.regular}`,
				borderRight: `0.0625rem solid ${theme.palette.gray3.regular}`
			}
		}),
		[selectSlotBgColor, theme?.palette?.gray3?.regular]
	);

	const columnMinWidth = useMemo<string | undefined>(() => {
		if (calendarView === 'day' && isSplitLayoutEnabled) {
			return MULTI_CALENDARS_COLUMN_MIN_WIDTH;
		}
		return undefined;
	}, [calendarView, isSplitLayoutEnabled]);

	const dayPropGetter = useCallback(
		(newDate: Date): { style: React.CSSProperties } => {
			const isToday =
				newDate.getDate() === new Date().getDate() &&
				newDate.getMonth() === new Date().getMonth() &&
				newDate.getFullYear() === new Date().getFullYear();

			let backgroundColor = theme.palette.gray3.regular;

			if (workingSchedule?.[newDate.getDay()]?.working) {
				backgroundColor = isToday ? theme.palette.highlight.regular : theme.palette.gray6.regular;
			}

			return {
				style: {
					minWidth: columnMinWidth,
					backgroundColor,
					borderBottom: `0.0625rem solid ${slotDayBorderColor(newDate)}`
				}
			};
		},
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
		(calendarEvent: EventType): boolean => {
			const isSameDay = moment(calendarEvent.start).isSame(moment(calendarEvent.end), 'day');

			if (!isSameDay) {
				/* Drag is disabled for events that span over multiple days due to an issue with the library */
				return false;
			}
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
		(calendarEvent: EventType): boolean => {
			const isSameDay = moment(calendarEvent.start).isSame(moment(calendarEvent.end), 'day');

			if (!isSameDay) {
				/* Resize is disabled for events that span over multiple days due to an issue with the library */
				return false;
			}
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

	const allDayAccessor = useCallback((calendarEvent: EventType): boolean => {
		const diffInDays = moment(calendarEvent.end).diff(calendarEvent.start, 'days');

		return diffInDays > 0 || calendarEvent.allDay;
	}, []);

	const onSelecting = useCallback(
		(calendarSlot: { resourceId?: string; start: Date; end: Date }): boolean => {
			if (!calendarSlot.resourceId) return true;
			const resCalendar = find(calendars, ['id', calendarSlot.resourceId]);
			const absFolderPath = resCalendar?.absFolderPath;
			const isTrashOrSubItem = isTrashOrNestedInIt({ id: calendarSlot.resourceId, absFolderPath });
			const isDefaultCalendar = resCalendar?.id === prefs.zimbraPrefDefaultCalendarId;
			return !summaryViewOpen && !action && !isTrashOrSubItem && isDefaultCalendar;
		},
		[action, calendars, prefs.zimbraPrefDefaultCalendarId, summaryViewOpen]
	);

	const scrollToTime = useMemo<Date>(
		() => new Date(new Date().setHours(startHour, 0, 0, 0)),
		[startHour]
	);

	const resources = useMemo<Array<CalendarResource> | undefined>(() => {
		if (calendarView === 'day' && isSplitLayoutEnabled) {
			return map(calendars, (calendar) => ({
				id: calendar.id,
				title: calendar.name,
				color: calendar.color
			}));
		}
		return undefined;
	}, [calendarView, calendars, isSplitLayoutEnabled]);

	return (
		<>
			{!isEmpty(calendars) && <CalendarSyncWithRange />}
			<CalendarStyle
				$primaryCalendar={primaryCalendar as { color?: { background?: string; color?: string } }}
				$summaryViewOpen={summaryViewOpen}
				$action={action}
				$headerMinWidth={columnMinWidth}
			/>
			{anchorElement && (
				<Popover
					onClick={(e): void => {
						e.stopPropagation();
					}}
					anchorEl={anchorElement}
					open={summaryViewOpen}
					styleAsModal
					placement="left"
					onClose={(): void => useAppStatusStore.setState({ summaryViewId: undefined })}
				>
					<MemoEventSummaryView
						events={events}
						onClose={(): void => {
							useAppStatusStore.setState({ summaryViewId: undefined });
						}}
					/>
				</Popover>
			)}
			<BigCalendar
				popup
				dayLayoutAlgorithm="no-overlap"
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
				workingSchedule={workingSchedule}
				onSelectSlot={handleSelect}
				scrollToTime={scrollToTime}
				onEventDrop={onEventDropOrResize}
				allDayMaxRows={3}
				onEventResize={onEventDropOrResize}
				formats={{ eventTimeRangeFormat: (): string => '' }}
				resizable
				showMultiDayTimes
				resizableAccessor={resizableAccessor}
				allDayAccessor={allDayAccessor}
				onSelecting={onSelecting}
				draggableAccessor={draggableAccessor}
			/>
			{action === EVENT_ACTIONS.EXPAND && <EventPanelView />}
		</>
	);
}
