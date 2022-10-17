/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { ThemeContext } from 'styled-components';
import {
	FOLDERS,
	getBridgedFunctions,
	useUserSettings,
	addBoard,
	t,
	replaceHistory
} from '@zextras/carbonio-shell-ui';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useDispatch, useSelector } from 'react-redux';
import { isEqual, isNil, minBy, omit, omitBy, size } from 'lodash';
import { min as datesMin, max as datesMax } from 'date-arithmetic';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useParams } from 'react-router-dom';
import { ModalManagerContext } from '@zextras/carbonio-design-system';
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
import { CALENDAR_ROUTE } from '../../constants';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { useCalendarDate, useCalendarView, useIsSummaryViewOpen } from '../../store/zustand/hooks';
import { useAppStatusStore } from '../../store/zustand/store';
import { searchAppointments } from '../../store/actions/search-appointments';
import { generateEditor } from '../../commons/editor-generator';
import { getInvite } from '../../store/actions/get-invite';
import CalendarStyle from './calendar-style';
import { store, StoreProvider } from '../../store/redux';
import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { ModifyStandardMessageModal } from '../modals/modify-standard-message-modal';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';

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

const getStart = ({ isAllDay, dropStart, isSeries, inviteStart, eventStart }) => {
	if (isAllDay) {
		return dropStart.startOf('day');
	}
	if (isSeries) {
		const diff = dropStart.diff(eventStart);
		return inviteStart.add(diff).valueOf();
	}
	return dropStart.valueOf();
};

const getEnd = ({ isAllDay, dropEnd, isSeries, inviteEnd, eventEnd, eventAllDay }) => {
	if (isAllDay || eventAllDay) {
		return dropEnd.startOf('day');
	}
	if (isSeries) {
		const diff = dropEnd.diff(eventEnd);
		return inviteEnd.add(diff).valueOf();
	}
	return dropEnd.valueOf();
};

export default function CalendarComponent() {
	const appointments = useSelector(selectAppointmentsArray);
	const selectedCalendars = useSelector(selectCheckedCalendarsMap);
	const dispatch = useDispatch();
	const theme = useContext(ThemeContext);
	const settings = useUserSettings();
	const createModal = useContext(ModalManagerContext);
	const calendarView = useCalendarView();
	const calendarDate = useCalendarDate();
	const timeZone = settings.prefs.zimbraPrefTimeZoneId;
	const summaryViewOpen = useIsSummaryViewOpen();
	const firstDayOfWeek = settings.prefs.zimbraPrefCalendarFirstDayOfWeek ?? 0;
	const localizer = momentLocalizer(moment);
	const [date, setDate] = useState(calendarDate);
	const calendars = useSelector(selectCalendars);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);
	const { action } = useParams();

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
			borderRight: `0.0625rem solid ${theme.palette.gray3.regular}`
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
			borderBottom: `0.0625rem solid ${slotDayBorderColor(newDate)}`
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
			if (!summaryViewOpen && !action) {
				const isAllDay =
					moment(e.end).hours() === moment(e.start).hours() &&
					moment(e.end).minutes() === moment(e.start).minutes() &&
					!moment(e.start).isSame(moment(e.end));
				const end = isAllDay ? moment(e.end).subtract(1, 'day') : moment(e.end);
				const { editor, callbacks } = generateEditor({
					context: {
						title: t('label.new_appointment', 'New Appointment'),
						start: moment(e.start).valueOf(),
						end: end.valueOf(),
						allDay: isAllDay ?? false,
						panel: false
					}
				});
				const storeData = store.getState();
				addBoard({
					url: `${CALENDAR_ROUTE}/`,
					title: editor.title,
					...storeData.editor.editors[editor.id],
					callbacks
				});
			}
		},
		[action, summaryViewOpen]
	);

	const onDropFn = useCallback(
		({ start, end, event, isAllDay, isSeries }) => {
			dispatch(
				getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ })
			).then(({ payload }) => {
				const inviteStart = moment(payload.m.inv[0].comp[0].s[0].u);
				const eventStart = moment(event.start);
				const dropStart = moment(start);
				const inviteEnd = moment(payload.m.inv[0].comp[0].e[0].u);
				const eventEnd = moment(event.end);
				const dropEnd = moment(end);
				const eventAllDay = event.allDay;
				const startTime = getStart({ isSeries, dropStart, isAllDay, inviteStart, eventStart });
				const endTime = getEnd({ isSeries, dropEnd, isAllDay, inviteEnd, eventEnd, eventAllDay });
				const invite = normalizeInvite(payload.m);
				const onConfirm = (draft, context) => {
					const { editor, callbacks } = generateEditor({
						event,
						invite,
						context: omitBy(
							{
								start: startTime,
								end: endTime,
								allDay: !!isAllDay,
								panel: false,
								richText: context?.text?.[1],
								plainText: context?.text?.[0]
							},
							isNil
						)
					});
					const storeData = store.getState();
					callbacks
						.onSave(
							omitBy(
								{
									draft,
									isNew: storeData.editor.editors[editor.id]?.isNew
								},
								isNil
							)
						)
						.then((res) => {
							if (res?.response) {
								const success = res?.response;
								getBridgedFunctions()?.createSnackbar({
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
				};
				if (size(invite.participants) > 0) {
					const closeModal = createModal(
						{
							children: (
								<StoreProvider>
									<ModifyStandardMessageModal
										title={t('label.edit')}
										onClose={() => closeModal()}
										confirmLabel={t('action.send_edit', 'Send Edit')}
										onConfirm={(context) => {
											onConfirm(false, context);
											closeModal();
										}}
										invite={invite}
										isEdited
									/>
								</StoreProvider>
							)
						},
						true
					);
				} else {
					onConfirm(true);
				}
			});
		},
		[createModal, dispatch]
	);

	const onEventDrop = useCallback(
		(appt) => {
			const { start, end, event, isAllDay } = appt;
			if (isAllDay && event.resource.isRecurrent && !event.resource.isException) {
				getBridgedFunctions()?.createSnackbar({
					key: `recurrent-moved-in-allDay`,
					replace: true,
					type: 'warning',
					hideButton: true,
					label: t(
						'recurrent_in_allday',
						'You cannot drag a recurrent appointment in a all day slot'
					),
					autoHideTimeout: 3000
				});
			} else if (
				!isEqual(event.start, start) ||
				!isEqual(event.end, end) ||
				event.allDay !== !!isAllDay
			) {
				const onEntireSeries = () => {
					const seriesEvent = {
						...event,
						resource: omit(event.resource, 'ridZ')
					};
					onDropFn({ start, end, event: seriesEvent, isAllDay, isSeries: true });
				};
				const onSingleInstance = () => {
					onDropFn({ start, end, event, isAllDay });
				};
				if (event.resource.isRecurrent) {
					const closeModal = createModal(
						{
							children: (
								<StoreProvider>
									<AppointmentTypeHandlingModal
										event={event}
										onClose={() => closeModal()}
										onSeries={onEntireSeries}
										onInstance={onSingleInstance}
									/>
								</StoreProvider>
							)
						},
						true
					);
				} else {
					onDropFn({ start, end, event, isAllDay });
				}
			}
		},
		[createModal, onDropFn]
	);

	const eventPropGetter = useCallback(
		(event) => ({
			style: {
				backgroundColor: event.resource.calendar.color.background,
				color: event.resource.calendar.color.color,
				boxSizing: 'border-box',
				margin: `0`,
				padding: `0.25rem 0.5rem`,
				borderRadius: `0.25rem`,
				cursor: `pointer`,
				width: `100%`,
				textAlign: `left`,
				transition: `border 0.15s ease-in-out, background 0.15s ease-in-out`,
				boxShadow: `0 0 0.875rem -0.5rem rgba(0, 0, 0, 0.5)`,
				border: `0.0625rem solid ${event.resource.calendar.color.color}`
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

	useEffect(() => {
		if (action && (action !== EventActionsEnum.EXPAND || action !== EventActionsEnum.EDIT)) {
			replaceHistory('');
		}
	}, [action]);

	return (
		<>
			<CalendarSyncWithRange />
			<CalendarStyle
				primaryCalendar={primaryCalendar}
				summaryViewOpen={summaryViewOpen}
				action={action}
			/>
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
				onSelecting={() => !summaryViewOpen && !action}
				draggableAccessor={(event) =>
					event.resource.iAmOrganizer && event.resource.calendar.id !== FOLDERS.TRASH
				}
			/>
		</>
	);
}
