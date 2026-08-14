/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useState } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { addBoard } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation, useFoldersMap, usePrefs } from '@zextras/carbonio-ui-commons';
import { max as datesMax, min as datesMin } from 'date-arithmetic';
import { endOfDay, getHours, getMinutes, isSameDay, startOfDay, subDays } from 'date-fns';
import { isArray, isEqual, isNil, omit, omitBy, size } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { generateEditor } from '../commons/editor-generator';
import { onSave } from '../commons/editor-save-send-fns';
import { CALENDAR_BOARD_ID, CALENDAR_ROUTE } from '../constants';
import { EVENT_DISPLAY_STATUS } from '../constants/api';
import { EVENT_ACTIONS } from '../constants/event-actions';
import { normalizeInvite } from '../normalizations/normalize-invite';
import { getInvite } from '../store/actions/get-invite';
import { StoreProvider } from '../store/redux';
import { useAppDispatch } from '../store/redux/hooks';
import {
	useCalendarDate,
	useCalendarView,
	useIsSummaryViewOpen,
	useSetRange
} from '../store/zustand/hooks';
import { AppState, useAppStatusStore } from '../store/zustand/store';
import { EventType } from '../types/event';
import { AppointmentTypeHandlingModal } from '../view/calendar/appointment-type-handle-modal';
import { ModifyStandardMessageModal } from '../view/modals/modify-standard-message-modal';

export const useCalendarComponentUtils = (): {
	onEventDropOrResize: (a: {
		start: string | Date;
		end: string | Date;
		event: EventType;
		isAllDay?: boolean;
		resourceId?: string | number;
	}) => void;
	handleSelect: (e: { start: Date; end: Date; resourceId?: string | number }) => void;
	onRangeChange: (a: { end: Date; start: Date } | Array<Date>) => void;
	onNavigate: (a: Date) => void;
	date: Date;
} => {
	const calendarDate = useCalendarDate();
	const calendarView = useCalendarView();
	const [date, setDate] = useState(calendarDate);
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const createSnackbar = useSnackbar();
	const { replaceHistory } = useHistoryNavigation();

	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const summaryViewOpen = useIsSummaryViewOpen();
	const setRange = useSetRange();
	const { action } = useParams<{
		action: typeof EVENT_ACTIONS.EXPAND | typeof EVENT_ACTIONS.EDIT | undefined;
	}>();
	const { zimbraPrefDefaultCalendarId } = usePrefs();

	useEffect(() => {
		if (action && action !== EVENT_ACTIONS.EXPAND) {
			replaceHistory(`/${CALENDAR_ROUTE}`);
		}
	}, [action, replaceHistory]);

	const getStart = useCallback(
		({
			isAllDay,
			dropStart,
			isSeries,
			inviteStart,
			eventStart
		}: {
			dropStart: Date;
			inviteStart: Date;
			eventStart: Date;
			isAllDay?: boolean;
			isSeries?: boolean;
		}) => {
			if (isAllDay) {
				return startOfDay(dropStart).getTime();
			}
			if (isSeries) {
				const diff = dropStart.getTime() - eventStart.getTime();
				return new Date(inviteStart.getTime() + diff).getTime();
			}

			return dropStart.getTime();
		},
		[]
	);

	const getEnd = useCallback(
		({
			isAllDay,
			dropStart,
			dropEnd,
			isSeries,
			inviteEnd,
			eventEnd,
			eventAllDay
		}: {
			dropStart: Date;
			dropEnd: Date;
			inviteEnd: Date;
			eventEnd: Date;
			isAllDay?: boolean;
			isSeries?: boolean;
			eventAllDay: boolean;
		}) => {
			if (isAllDay) {
				return startOfDay(dropEnd).getTime();
			}
			if (eventAllDay) {
				// converting away from all-day: stay within the dropped-on day
				return endOfDay(dropStart).getTime();
			}
			if (isSeries) {
				const diff = dropEnd.getTime() - eventEnd.getTime();
				return new Date(inviteEnd.getTime() + diff).getTime();
			}
			return dropEnd.getTime();
		},
		[]
	);

	const onDropOrResizeFn = useCallback(
		({
			start,
			end,
			event,
			isAllDay,
			isSeries
		}: {
			start: string | Date;
			end: string | Date;
			event: EventType;
			isAllDay?: boolean;
			isSeries?: boolean;
		}): void => {
			dispatch(
				getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ })
			).then(({ payload }) => {
				if (payload) {
					const inviteStart = new Date(payload.m[0].inv[0].comp[0].s[0].u);
					const eventStart = event.start;
					const dropStart = new Date(start);
					const inviteEnd = new Date(payload.m[0].inv[0].comp[0].e[0].u);
					const eventEnd = event.end;
					const dropEnd = new Date(end);
					const eventAllDay = event.allDay;
					const resolvedAllDay =
						calendarView === 'month' ? (isAllDay ?? eventAllDay) : (isAllDay ?? false);
					const invite = normalizeInvite(payload.m[0]);
					const startTime = getStart({
						isSeries,
						dropStart,
						isAllDay: resolvedAllDay,
						inviteStart,
						eventStart
					});
					const endTime = getEnd({
						isSeries,
						dropStart,
						dropEnd,
						isAllDay: resolvedAllDay,
						inviteEnd,
						eventEnd,
						eventAllDay
					});

					const handleSaveResponse = (res: Awaited<ReturnType<typeof onSave>>): void => {
						if (res?.response === undefined) {
							return;
						}
						createSnackbar({
							key: `calendar-moved-root`,
							replace: true,
							severity: res.response ? 'info' : 'warning',
							hideButton: true,
							label: res.response
								? t('message.snackbar.calendar_edits_saved', 'Edits saved correctly')
								: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000
						});
					};

					const onConfirm = (draft: boolean, context?: { text: Array<string> }): void => {
						// generateEditor snapshots its result as the invitation's "original"
						// baseline (createNewEditor sets originalEditors[id] to the very
						// editor it just built). Passing the already-dropped/resized
						// start/end/allDay in its context would bake them into that baseline
						// too, making before and after identical — which is why the
						// invitation-changes banner never appeared for drag/resize edits.
						// Build the editor from the untouched invite first, then merge the
						// drop's new values only into the object handed to onSave.
						const editor = generateEditor({
							event,
							invite,
							context: { dispatch, folders: calendarFolders, panel: false }
						});
						const updatedEditor = {
							...editor,
							start: startTime,
							end: endTime,
							allDay: resolvedAllDay,
							...omitBy(
								{
									richText: context?.text?.[1],
									plainText: context?.text?.[0]
								},
								isNil
							)
						};
						onSave({ draft, editor: updatedEditor, isNew: false, dispatch }).then(
							handleSaveResponse
						);
					};
					if (
						size(invite.participants) > 0 &&
						(invite.isException || !!event.resource.ridZ) &&
						invite.isOrganizer &&
						!event.resource.inviteNeverSent
					) {
						const modalId = 'modify-invite-message';
						createModal(
							{
								id: modalId,
								children: (
									<StoreProvider>
										<ModifyStandardMessageModal
											title={t('label.edit')}
											onClose={(): void => closeModal(modalId)}
											confirmLabel={t('action.send_edit', 'Send Edit')}
											onConfirm={(context): void => {
												onConfirm(false, context);
												closeModal(modalId);
											}}
											invite={invite}
											isEdited
										/>
									</StoreProvider>
								),
								onClose: () => {
									closeModal(modalId);
								}
							},
							true
						);
					} else {
						onConfirm(true);
					}
				}
			});
		},
		[
			calendarFolders,
			calendarView,
			closeModal,
			createModal,
			createSnackbar,
			dispatch,
			getEnd,
			getStart,
			t
		]
	);

	const onEventDropOrResize = useCallback(
		({
			start,
			end,
			event,
			isAllDay,
			resourceId
		}: {
			start: string | Date;
			end: string | Date;
			event: EventType;
			isAllDay?: boolean;
			resourceId?: string | number;
		}) => {
			const isDefaultCalendar = resourceId
				? String(resourceId) === zimbraPrefDefaultCalendarId
				: true;
			if (!isDefaultCalendar) {
				return;
			}

			if (isAllDay && event.resource.isRecurrent && !event.resource.isException) {
				createSnackbar({
					key: `recurrent-moved-in-allDay`,
					replace: true,
					severity: 'warning',
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
				(event.allDay !== isAllDay && isSameDay(event.start, event.end))
			) {
				const onEntireSeries = (): void => {
					const seriesEvent = {
						...event,
						resource: omit(event.resource, 'ridZ')
					};
					onDropOrResizeFn({ start, end, event: seriesEvent, isAllDay, isSeries: true });
				};
				const onSingleInstance = (): void => {
					onDropOrResizeFn({ start, end, event, isAllDay });
				};
				if (event.resource.isRecurrent) {
					const modalId = 'modify-recurrent-appointment';
					createModal(
						{
							id: modalId,
							children: (
								<StoreProvider>
									<AppointmentTypeHandlingModal
										event={event}
										onClose={(): void => closeModal(modalId)}
										onSeries={onEntireSeries}
										onInstance={onSingleInstance}
									/>
								</StoreProvider>
							),
							onClose: () => {
								closeModal(modalId);
							}
						},
						true
					);
				} else {
					onDropOrResizeFn({ start, end, event, isAllDay });
				}
			}
		},
		[closeModal, createModal, createSnackbar, onDropOrResizeFn, t, zimbraPrefDefaultCalendarId]
	);

	const handleSelect = useCallback(
		(e: { resourceId?: string | number; end: Date; start: Date }) => {
			const isDefaultCalendar = e.resourceId
				? String(e.resourceId) === zimbraPrefDefaultCalendarId
				: true;

			if (!summaryViewOpen && !action && isDefaultCalendar) {
				const isAllDay =
					getHours(e.end) === getHours(e.start) &&
					getMinutes(e.end) === getMinutes(e.start) &&
					e.start.getTime() !== e.end.getTime();
				const end = isAllDay ? subDays(e.end, 1) : e.end;
				const editor = generateEditor({
					context: {
						dispatch,
						folders: calendarFolders,
						start: e.start.getTime(),
						originalStart: e.start.getTime(),
						originalEnd: end.getTime(),
						end: end.getTime(),
						allDay: isAllDay ?? false,
						freeBusy: isAllDay ? EVENT_DISPLAY_STATUS.FREE : EVENT_DISPLAY_STATUS.BUSY,
						panel: false
					}
				});
				addBoard({
					boardViewId: CALENDAR_BOARD_ID,
					title: editor?.title ?? '',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					editor
				});
			}
		},
		[action, calendarFolders, dispatch, summaryViewOpen, zimbraPrefDefaultCalendarId]
	);

	const onRangeChange = useCallback(
		(range: Array<Date> | { start: Date; end: Date }) => {
			if (isArray(range)) {
				if (range?.length) {
					const min = datesMin(...range);
					const max = datesMax(...range);
					setRange({
						start: startOfDay(new Date(min)).getTime(),
						end: endOfDay(new Date(max)).getTime()
					});
				}
			} else {
				setRange({
					start: startOfDay(new Date(range.start)).getTime(),
					end: endOfDay(new Date(range.end)).getTime()
				});
			}
		},
		[setRange]
	);

	const onNavigate = useCallback(
		(newDate: Date) => {
			useAppStatusStore.setState((s: AppState) => ({ ...s, date: newDate }));
			return setDate(newDate);
		},
		[setDate]
	);

	return { onEventDropOrResize, handleSelect, onRangeChange, onNavigate, date };
};
