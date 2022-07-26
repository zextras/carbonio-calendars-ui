/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { TFunction } from 'i18next';
import { useParams } from 'react-router-dom';
import { generateEditor } from '../../../commons/editor-generator';
import { normalizeEditor } from '../../../normalizations/normalize-editor';
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { EventType } from '../../../types/event';
import { RouteParams } from '../../../types/route-params';
import { deleteEvent, sendResponse } from './delete-actions';
import { moveAppointmentRequest } from '../../../store/actions/move-appointment';
import { SnackbarArgumentType } from '../../../types/delete-appointment';
import { Invite } from '../../../types/store/invite';

const generateAppointmentDeletedSnackbar = (
	res: { type: string | string[] },
	t: TFunction,
	createSnackbar: (obj: SnackbarArgumentType) => void,
	undoAction?: () => void,
	isRecurrentSeries?: boolean
): void => {
	if (res.type.includes('fulfilled')) {
		let snackbarLabel =
			undoAction === undefined
				? t('message.snackbar.appt_moved_to_trash', 'Appointment moved to trash')
				: t('message.snackbar.appointment_permanently_deleted', 'Appointment permanently deleted');
		if (isRecurrentSeries) {
			snackbarLabel = t(
				'message.snackbar.series_deleted',
				'Series successfully deleted. Attendees will receive the cancellation notification.'
			);
		}
		createSnackbar({
			key: 'send',
			replace: true,
			type: 'info',
			label: snackbarLabel,
			autoHideTimeout: 3000,
			hideButton: true,
			actionLabel: t('label.undo', 'Undo'),
			onActionClick: () => (undoAction ? undoAction() : null)
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
	createSnackbar: (obj: SnackbarArgumentType) => void
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
	isInstance?: boolean;
	replaceHistory: (a: string) => void;
	onClose: () => void;
};

type UseDeleteActionsType = {
	deleteNonRecurrentEvent: (newMessage: object) => void;
	deleteRecurrentInstance: (newMessage: object) => void;
	deleteRecurrentSerie: (newMessage: object) => void;
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
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext) as (obj: SnackbarArgumentType) => void;
	const [deleteAll, setDeleteAll] = useState(true);
	const [notifyOrganizer, setNotifyOrganizer] = useState(false);
	const toggleNotifyOrganizer = useCallback(() => {
		setNotifyOrganizer((a) => !a);
	}, []);

	const toggleDeleteAll = useCallback(() => {
		setDeleteAll((a) => !a);
	}, []);

	const deleteNonRecurrentEvent = useCallback(
		(newMessage) => {
			context.onClose();
			let isCanceled = false;
			const restoreAppointment = (): void => {
				isCanceled = true;
				dispatch(
					moveAppointmentRequest({
						id: event.resource.id,
						l: event.resource.calendar.id
					})
				)
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.then((res: { type: string | string[] }) => {
						generateAppointmentRestoredSnackbar(res, t, createSnackbar);
					});
			};
			context.replaceHistory('');
			const ctxt = {
				dispatch,
				t,
				isInstance: context.isInstance,
				createSnackbar,
				newMessage: newMessage?.text?.[0]
			};
			deleteEvent(event, ctxt)
				.then((res: { type: string | string[] }) => {
					generateAppointmentDeletedSnackbar(res, t, createSnackbar, restoreAppointment);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							sendResponse(event, ctxt);
						}
					}, 5000)
				);
		},
		[event, context, createSnackbar, dispatch, notifyOrganizer, t]
	);

	const deleteRecurrentSerie = useCallback(
		(newMessage) => {
			context.onClose();
			let isCanceled = false;
			const restoreRecurrentSeries = (): void => {
				isCanceled = true;
				dispatch(
					moveAppointmentRequest({
						id: event.resource.id,
						l: event.resource.calendar.id
					})
				)
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.then((res: { type: string | string[] }) => {
						generateAppointmentRestoredSnackbar(res, t, createSnackbar);
					});
			};
			context.replaceHistory('');
			const ctxt = {
				dispatch,
				t,
				isInstance: context.isInstance,
				createSnackbar,
				newMessage: newMessage?.text?.[0]
			};
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
													d: moment(event?.resource?.ridZ).subtract(1, 'day').format('YYYYMMDD')
												}
											]
										}
									]
								}
							]
						}
					]
				};
				const { editor } = generateEditor({
					event,
					invite: modifiedInvite,
					context: { panel: true }
				});
				return !deleteAll
					? dispatch(modifyAppointment({ id: editor.id, draft: invite.draft }))
					: deleteEvent(event, ctxt);
			};

			deleteFunction()
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res: { type: string | string[] }) => {
					generateAppointmentDeletedSnackbar(res, t, createSnackbar, restoreRecurrentSeries, true);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							sendResponse(event, ctxt);
						}
					}, 5000)
				);
		},

		[event, context, createSnackbar, deleteAll, dispatch, invite, notifyOrganizer, t]
	);

	const deleteRecurrentInstance = useCallback(
		(newMessage) => {
			context.onClose();
			const isCanceled = false;
			context.replaceHistory('');
			const ctxt = {
				dispatch,
				newMessage: newMessage?.text?.[0],
				t,
				isInstance: context.isInstance,
				createSnackbar,
				inst: {
					d: invite?.start?.tz
						? moment(event.start).format('YYYYMMDD[T]HHmmss')
						: moment(event.start).utc().format('YYYYMMDD[T]HHmmss[Z]'),
					tz: invite?.start?.tz
				},
				s: moment(event.start).valueOf()
			};
			deleteEvent(event, ctxt)
				.then((res: { type: string | string[] }) => {
					generateAppointmentDeletedSnackbar(res, t, createSnackbar);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
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
