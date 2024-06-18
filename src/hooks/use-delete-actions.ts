/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo, useState } from 'react';

import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { size } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Dispatch } from 'redux';

import { deleteEvent, sendResponse } from '../actions/delete-actions';
import { Folder, Folders } from '../carbonio-ui-commons/types/folder';
import { generateEditor } from '../commons/editor-generator';
import { moveAppointmentRequest } from '../store/actions/move-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
import { useAppDispatch } from '../store/redux/hooks';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { getInstanceExceptionId } from '../utils/event';

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
			type: 'success',
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
			type: 'error',
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
			type: 'success',
			label: t('appt_restored_successfully', 'Appointment restored successfully'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	} else {
		createSnackbar({
			key: `delete`,
			replace: true,
			type: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	}
};

type AccountContext = {
	isSingleInstance?: boolean;
	dispatch: Dispatch;
	replaceHistory: (a: string) => void;
	onClose: () => void;
	folders: Folders;
};

export type UseDeleteActionsType = {
	deleteNonRecurrentEvent: (newMessage?: object) => void;
	deleteRecurrentInstance: (newMessage?: object) => void;
	deleteRecurrentSerie: (newMessage?: object) => void;
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

	const deleteNonRecurrentEvent = useCallback(
		({ editor: newMessage, onBoardClose }) => {
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
					onBoardClose && onBoardClose();
					generateAppointmentRestoredSnackbar(res, t, createSnackbar);
				});
			};
			context.replaceHistory('');
			const ctxt = {
				dispatch,
				t,
				isInstance: context.isSingleInstance,
				createSnackbar,
				newMessage: newMessage?.text?.[0],
				folders: context.folders
			};
			deleteEvent(event, ctxt)
				.then((res: { type: string | string[] }) => {
					onBoardClose && onBoardClose();
					generateAppointmentDeletedSnackbar(res, t, createSnackbar, restoreAppointment);
				})
				.then(() => {
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							onBoardClose && onBoardClose();
							sendResponse(event, ctxt);
						}
					}, 5000);
				});
		},
		[event, context, createSnackbar, dispatch, notifyOrganizer, t]
	);

	const deleteRecurrentSerie = useCallback(
		({ editor: newMessage, onBoardClose }) => {
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
			context.replaceHistory('');
			const ctxt = {
				dispatch,
				t,
				isInstance: context.isSingleInstance,
				createSnackbar,
				newMessage: newMessage?.text?.[0]
			};
			const eventDate = event?.resource?.ridZ ?? event.start.valueOf();
			const untilDate = moment(eventDate).subtract(1, 'day').format('YYYYMMDD');
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
				const isTheFirstInstance = moment(untilDate).isSameOrBefore(moment(invite.start.d));
				const draft = !(size(invite?.participants) > 0);
				return deleteAll || isTheFirstInstance
					? deleteEvent(event, ctxt)
					: dispatch(modifyAppointment({ editor, draft }));
			};
			deleteFunction()
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res: { type: string | string[] }) => {
					onBoardClose && onBoardClose();
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
							onBoardClose && onBoardClose();
							sendResponse(event, ctxt);
						}
					}, 5000)
				);
		},

		[event, context, createSnackbar, deleteAll, dispatch, invite, notifyOrganizer, t]
	);

	const deleteRecurrentInstance = useCallback(
		({ editor: newMessage, onBoardClose }) => {
			context.onClose();
			const isCanceled = false;
			context.replaceHistory('');
			const ctxt = {
				dispatch,
				newMessage: newMessage?.text?.[0],
				t,
				isInstance: context.isSingleInstance,
				createSnackbar,
				inst: getInstanceExceptionId({
					start: event.start,
					tz: invite?.start?.tz,
					allDay: event?.allDay
				}),
				s: moment(event.start).valueOf(),
				folders: context.folders
			};
			deleteEvent(event, ctxt)
				.then((res: { type: string | string[] }) => {
					onBoardClose && onBoardClose();
					generateAppointmentDeletedSnackbar(res, t, createSnackbar);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							onBoardClose && onBoardClose();
							sendResponse(event, ctxt);
						}
					}, 5000)
				);
		},
		[event, context, createSnackbar, dispatch, invite?.start?.tz, notifyOrganizer, t]
	);

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
