/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo, useState } from 'react';

import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';
import { useHistoryNavigation, Folders } from '@zextras/carbonio-ui-commons';
import { format, parse, subDays } from 'date-fns';
import { TFunction } from 'i18next';
import { size } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Dispatch } from 'redux';

import { deleteEvent, sendResponse } from '../actions/delete-actions';
import { generateEditor } from '../commons/editor-generator';
import { CALENDAR_ROUTE } from '../constants';
import { buildMessagePart } from '../store/actions/move-appointment-to-trash';
import { moveAppointmentRequest } from '../store/actions/move-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
import { useAppDispatch } from '../store/redux/hooks';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { parseDateFromICS } from '../utils/dates';
import { getInstanceExceptionId } from '../utils/event';
import { MimePartInfo, Msg } from 'soap/send-invite-reply-request';

const generateAppointmentDeletedSnackbar = (
	res: { type: string | string[] },
	t: TFunction,
	createSnackbar: CreateSnackbarFn,
	undoAction?: () => void,
	isRecurrentSeries?: boolean,
	isDraft?: boolean
): void => {
	if (res.type.includes('fulfilled')) {
		let snackbarLabel =
			undoAction === undefined
				? t('message.snackbar.appointment_permanently_deleted', 'Appointment permanently deleted')
				: t('message.snackbar.appt_moved_to_trash', 'Appointment moved to trash');
		if (isRecurrentSeries) {
			if (isDraft) {
				snackbarLabel = t(
					'message.snackbar.series_deleted_no_notification',
					'Series moved to trash'
				);
			} else {
				snackbarLabel = t(
					'message.snackbar.series_deleted',
					'Series moved to trash. Attendees will receive the cancellation notification'
				);
			}
		}
		createSnackbar({
			key: 'send',
			replace: true,
			severity: 'success',
			label: snackbarLabel,
			autoHideTimeout: 3000,
			hideButton: true,
			actionLabel: t('label.undo', 'Undo'),
			onActionClick: () => (undoAction ? undoAction() : undefined)
		});
	} else {
		createSnackbar({
			key: `delete`,
			replace: true,
			severity: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	}
};

const generateAppointmentRestoredSnackbar = (
	res: { type: string | string[] },
	t: TFunction,
	createSnackbar: CreateSnackbarFn
): void => {
	if (res.type.includes('fulfilled')) {
		createSnackbar({
			key: 'send',
			replace: true,
			severity: 'success',
			label: t('appt_restored_successfully', 'Appointment restored successfully'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	} else {
		createSnackbar({
			key: `delete`,
			replace: true,
			severity: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	}
};

type AccountContext = {
	isSingleInstance?: boolean;
	dispatch: Dispatch;
	onClose: () => void;
	folders: Folders;
};

export type UseDeleteActionsType = {
	deleteNonRecurrentEvent: () => void;
	deleteRecurrentInstance: () => void;
	deleteRecurrentSerie: () => void;
	toggleNotifyOrganizer: () => void;
	toggleDeleteAll: () => void;
	deleteAll: boolean;
	notifyOrganizer: boolean;
};

export const useDeleteActions = (
	event: EventType,
	invite: Invite,
	context: AccountContext
): UseDeleteActionsType => {
	const [t] = useTranslation();
	const { replaceHistory } = useHistoryNavigation();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();
	const [deleteAll, setDeleteAll] = useState(true);
	const [notifyOrganizer, setNotifyOrganizer] = useState(false);
	const toggleNotifyOrganizer = useCallback(() => {
		setNotifyOrganizer((a) => !a);
	}, []);

	const toggleDeleteAll = useCallback(() => {
		setDeleteAll((a) => !a);
	}, []);

	const deleteNonRecurrentEvent = useCallback(() => {
		context.onClose();
		let isCanceled = false;
		const restoreAppointment = (): void => {
			isCanceled = true;
			dispatch(
				moveAppointmentRequest({
					id: event.resource.inviteId,
					l: event.resource.calendar.id
				})
			).then((res: { type: string | string[] }) => {
				generateAppointmentRestoredSnackbar(res, t, createSnackbar);
			});
		};
		replaceHistory(`/${CALENDAR_ROUTE}`);
		const ctxt = {
			dispatch,
			t,
			isInstance: context.isSingleInstance,
			createSnackbar,
			folders: context.folders
		};
		deleteEvent(event, ctxt)
			.then((res: { type: string | string[] }) => {
				generateAppointmentDeletedSnackbar(res, t, createSnackbar, restoreAppointment);
			})
			.then(() => {
				setTimeout(() => {
					if (notifyOrganizer && !isCanceled) {
						sendResponse(event, ctxt);
					}
				}, 5000);
			});
	}, [context, replaceHistory, dispatch, t, createSnackbar, event, notifyOrganizer]);

	const deleteRecurrentSerie = useCallback(() => {
		context?.onClose && context?.onClose();
		let isCanceled = false;
		const restoreRecurrentSeries = (): void => {
			isCanceled = true;
			dispatch(
				moveAppointmentRequest({
					id: event.resource.inviteId,
					l: event.resource.calendar.id
				})
			).then((res: { type: string | string[] }) => {
				generateAppointmentRestoredSnackbar(res, t, createSnackbar);
			});
		};
		replaceHistory(`/${CALENDAR_ROUTE}`);
		const ctxt = {
			dispatch,
			t,
			isInstance: context.isSingleInstance,
			createSnackbar
		};
		const eventDate = event?.resource?.ridZ ?? event.start.valueOf();
		const parsedEventDate =
			typeof eventDate === 'string' ? parseDateFromICS(eventDate) : new Date(eventDate);
		const untilDate = format(subDays(parsedEventDate, 1), 'yyyyMMdd');
		const deleteFunction = (): void => {
			const modifiedInvite = {
				...invite,
				recurrenceRule: [
					{
						add: [
							{
								rule: [
									{
										...invite?.recurrenceRule[0]?.add[0]?.rule[0],
										until: [
											{
												d: untilDate
											}
										]
									}
								]
							}
						]
					}
				]
			};
			const editor = generateEditor({
				event,
				invite: modifiedInvite,
				context: {
					dispatch: context.dispatch,
					isInstance: context.isSingleInstance,
					folders: context.folders
				}
			});
			const untilDateParsed = parse(untilDate, 'yyyyMMdd', new Date());
			let startDateParsed: Date;
			if (invite.start?.u) {
				startDateParsed = new Date(invite.start.u);
			} else if (invite.start.d) {
				startDateParsed = parseDateFromICS(invite.start.d);
			} else {
				startDateParsed = new Date(0);
			}
			const isTheFirstInstance = untilDateParsed <= startDateParsed;
			const draft = !(size(invite?.participants) > 0);
			return deleteAll || isTheFirstInstance
				? deleteEvent(event, ctxt)
				: dispatch(modifyAppointment({ editor, draft }));
		};
		deleteFunction()
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.then((res: { type: string | string[] }) => {
				generateAppointmentDeletedSnackbar(
					res,
					t,
					createSnackbar,
					restoreRecurrentSeries,
					true,
					event.resource.inviteNeverSent
				);
			})
			.then(
				setTimeout(() => {
					if (notifyOrganizer && !isCanceled) {
						sendResponse(event, ctxt);
					}
				}, 5000)
			);
	}, [
		context,
		replaceHistory,
		dispatch,
		t,
		createSnackbar,
		event,
		invite,
		deleteAll,
		notifyOrganizer
	]);

	const deleteRecurrentInstance = useCallback(() => {
		context.onClose();
		replaceHistory(`/${CALENDAR_ROUTE}`);
		const ctxt = {
			dispatch,
			t,
			isInstance: context.isSingleInstance,
			createSnackbar,
			inst: getInstanceExceptionId({
				start: event.start,
				tz: invite?.start?.tz,
				allDay: event?.allDay
			}),
			s: event.start.getTime(),
			folders: context.folders
		};
		if (notifyOrganizer) {
			// First send the decline reply to notify the organizer (creates a declined exception),
			// then cancel that exception to move it to trash without sending further emails.
			// sendInviteResponseFulfilled removes the invite from the store (to trigger a re-fetch),
			// so we pass a snapshot via inv before it is deleted.
			const cancelMessage: Msg = {
				su: `${t('label.cancelled', 'Cancelled')}: ${invite?.name ?? ''}`,
				mp: buildMessagePart({
					t,
					fullInvite: invite,
					newMessage: `${t('message.meeting_removed_from_calendar', 'The following meeting has been removed from your calendar')}:`,
					deleteSingleInstance: true,
					inst: ctxt.inst
				}) as MimePartInfo
			};
			const ctxtWithInviteSnapshot = { ...ctxt, inv: invite };
			sendResponse(event, ctxtWithInviteSnapshot, ctxt.inst, cancelMessage).then(
				(res: { type: string }) => {
					if (res.type.includes('fulfilled')) {
						deleteEvent(event, ctxtWithInviteSnapshot).then(
							(deleteRes: { type: string | string[] }) => {
								generateAppointmentDeletedSnackbar(deleteRes, t, createSnackbar);
							}
						);
					} else {
						generateAppointmentDeletedSnackbar(res, t, createSnackbar);
					}
				}
			);
		} else {
			deleteEvent(event, ctxt).then((res: { type: string | string[] }) => {
				generateAppointmentDeletedSnackbar(res, t, createSnackbar);
			});
		}
	}, [context, replaceHistory, dispatch, t, createSnackbar, event, invite, notifyOrganizer]);

	return useMemo(
		() => ({
			deleteNonRecurrentEvent,
			deleteRecurrentInstance,
			deleteRecurrentSerie,
			toggleNotifyOrganizer,
			toggleDeleteAll,
			deleteAll,
			notifyOrganizer
		}),
		[
			deleteNonRecurrentEvent,
			deleteRecurrentInstance,
			deleteRecurrentSerie,
			deleteAll,
			toggleDeleteAll,
			notifyOrganizer,
			toggleNotifyOrganizer
		]
	);
};
