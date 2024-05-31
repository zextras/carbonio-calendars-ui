/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useState } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { addBoard, replaceHistory } from '@zextras/carbonio-shell-ui';
import { max as datesMax, min as datesMin } from 'date-arithmetic';
import { isEqual, isNil, omit, omitBy, size } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useFoldersMap } from '../carbonio-ui-commons/store/zustand/folder';
import { generateEditor } from '../commons/editor-generator';
import { onSave } from '../commons/editor-save-send-fns';
import { CALENDAR_ROUTE } from '../constants';
import { normalizeInvite } from '../normalizations/normalize-invite';
import { getInvite } from '../store/actions/get-invite';
import { StoreProvider } from '../store/redux';
import { useAppDispatch } from '../store/redux/hooks';
import { useCalendarDate, useIsSummaryViewOpen, useSetRange } from '../store/zustand/hooks';
import { AppState, useAppStatusStore } from '../store/zustand/store';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { AppointmentTypeHandlingModal } from '../view/calendar/appointment-type-handle-modal';
import { ModifyStandardMessageModal } from '../view/modals/modify-standard-message-modal';

export const useCalendarComponentUtils = (): {
	onEventDropOrResize: (a: {
		start: Date;
		end: Date;
		event: EventType;
		isAllDay?: boolean;
	}) => void;
	handleSelect: (e: { start: Date; end: Date }) => void;
	onRangeChange: (a: { end: Date; start: Date } | Array<Date>) => void;
	onNavigate: (a: Date) => void;
	date: Date;
} => {
	const calendarDate = useCalendarDate();
	const [date, setDate] = useState(calendarDate);
	const [t] = useTranslation();
	const createModal = useModal();
	const createSnackbar = useSnackbar();

	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const summaryViewOpen = useIsSummaryViewOpen();
	const setRange = useSetRange();
	const { action } = useParams<{
		action: typeof EventActionsEnum.EXPAND | typeof EventActionsEnum.EDIT | undefined;
	}>();

	useEffect(() => {
		if (action && action !== EventActionsEnum.EXPAND) {
			replaceHistory('');
		}
	}, [action]);

	const getStart = useCallback(({ isAllDay, dropStart, isSeries, inviteStart, eventStart }) => {
		if (isAllDay) {
			return dropStart.startOf('day').valueOf();
		}
		if (isSeries) {
			const diff = dropStart.diff(eventStart);
			return inviteStart.add(diff).valueOf();
		}
		return dropStart.valueOf();
	}, []);

	const getEnd = useCallback(
		({ isAllDay, dropEnd, isSeries, inviteEnd, eventEnd, eventAllDay }) => {
			if (isAllDay || eventAllDay) {
				return dropEnd.startOf('day').valueOf();
			}
			if (isSeries) {
				const diff = dropEnd.diff(eventEnd);
				return inviteEnd.add(diff).valueOf();
			}
			return dropEnd.valueOf();
		},
		[]
	);

	const onDropOrResizeFn = useCallback(
		({ start, end, event, isAllDay, isSeries }) => {
			dispatch(
				getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ })
			).then(({ payload }) => {
				if (payload) {
					const inviteStart = moment(payload.m[0].inv[0].comp[0].s[0].u);
					const eventStart = moment(event.start);
					const dropStart = moment(start);
					const inviteEnd = moment(payload.m[0].inv[0].comp[0].e[0].u);
					const eventEnd = moment(event.end);
					const dropEnd = moment(end);
					const eventAllDay = event.allDay;
					const startTime = getStart({ isSeries, dropStart, isAllDay, inviteStart, eventStart });
					const endTime = getEnd({ isSeries, dropEnd, isAllDay, inviteEnd, eventEnd, eventAllDay });
					const invite = normalizeInvite(payload.m[0]);

					const onConfirm = (draft: boolean, context?: { text: Array<string> }): void => {
						const contextObj = {
							dispatch,
							folders: calendarFolders,
							start: startTime,
							end: endTime,
							allDay: !!isAllDay,
							panel: false
						};
						const editor = generateEditor({
							event,
							invite,
							context: {
								...contextObj,
								...omitBy(
									{
										richText: context?.text?.[1],
										plainText: context?.text?.[0]
									},
									isNil
								)
							}
						});
						onSave({ draft, editor, isNew: false, dispatch }).then((res) => {
							if (res?.response) {
								const success = res?.response;
								createSnackbar({
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
					if (
						size(invite.participants) > 0 &&
						(invite.isException || !!event.resource.ridZ) &&
						invite.isOrganizer &&
						!event.resource.inviteNeverSent
					) {
						const closeModal = createModal(
							{
								children: (
									<StoreProvider>
										<ModifyStandardMessageModal
											title={t('label.edit')}
											onClose={(): void => closeModal()}
											confirmLabel={t('action.send_edit', 'Send Edit')}
											onConfirm={(context): void => {
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
				}
			});
		},
		[calendarFolders, createModal, createSnackbar, dispatch, getEnd, getStart, t]
	);

	const onEventDropOrResize = useCallback(
		({ start, end, event, isAllDay }) => {
			if (isAllDay && event.resource.isRecurrent && !event.resource.isException) {
				createSnackbar({
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
				(event.allDay !== !!isAllDay && moment(event.start).day() === moment(event.end).day())
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
					const closeModal = createModal(
						{
							children: (
								<StoreProvider>
									<AppointmentTypeHandlingModal
										event={event}
										onClose={(): void => closeModal()}
										onSeries={onEntireSeries}
										onInstance={onSingleInstance}
									/>
								</StoreProvider>
							)
						},
						true
					);
				} else {
					onDropOrResizeFn({ start, end, event, isAllDay });
				}
			}
		},
		[createModal, createSnackbar, onDropOrResizeFn, t]
	);

	const handleSelect = useCallback(
		(e) => {
			if (!summaryViewOpen && !action) {
				const isAllDay =
					moment(e.end).hours() === moment(e.start).hours() &&
					moment(e.end).minutes() === moment(e.start).minutes() &&
					!moment(e.start).isSame(moment(e.end));
				const end = isAllDay ? moment(e.end).subtract(1, 'day') : moment(e.end);
				const editor = generateEditor({
					context: {
						dispatch,
						folders: calendarFolders,
						start: moment(e.start).valueOf(),
						end: end.valueOf(),
						allDay: isAllDay ?? false,
						freeBusy: isAllDay ? 'F' : 'B',
						panel: false
					}
				});
				addBoard({
					url: `${CALENDAR_ROUTE}/`,
					title: editor?.title ?? '',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					editor
				});
			}
		},
		[action, calendarFolders, dispatch, summaryViewOpen]
	);

	const onRangeChange = useCallback(
		(range) => {
			if (range.length) {
				const min = datesMin(...range);
				const max = datesMax(...range);
				setRange({
					start: moment(min).startOf('day').valueOf(),
					end: moment(max).endOf('day').valueOf()
				});
			} else {
				setRange({
					start: moment(range.start).startOf('day').valueOf(),
					end: moment(range.end).endOf('day').valueOf()
				});
			}
		},
		[setRange]
	);

	const onNavigate = useCallback(
		(newDate) => {
			useAppStatusStore.setState((s: AppState) => ({ ...s, date: newDate }));
			return setDate(newDate);
		},
		[setDate]
	);

	return { onEventDropOrResize, handleSelect, onRangeChange, onNavigate, date };
};
