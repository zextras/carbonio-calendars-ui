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
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { deleteEvent, generateSnackbar, sendResponse } from './delete-actions';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDeleteActions = (event: any, invite: any, context: any): any => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
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
			let isCanceled = false;
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			const infoSnackbar = (hideButton = false) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'info',
					label: t('message.snackbar.appt_moved_to_trash', 'Appointment moved to trash'),
					autoHideTimeout: 3000,
					hideButton,
					actionLabel: 'Undo',
					onActionClick: () => {
						isCanceled = true;
					}
				});
			};

			infoSnackbar();

			setTimeout(() => {
				if (!isCanceled) {
					const ctxt = {
						dispatch,
						t,
						isInstance: context.isInstance,
						createSnackbar,
						newMessage: newMessage?.text?.[0]
					};
					if (notifyOrganizer) {
						sendResponse(event, invite, ctxt).then(() => {
							deleteEvent(event, invite, ctxt).then((res: any) => {
								generateSnackbar({
									res,
									t: context.t,
									createSnackbar: context.createSnackbar,
									isTrash: true
								});
							});
						});
					} else {
						deleteEvent(event, invite, ctxt);
					}
				}
			}, 3000);
			context.onClose();
		},
		[context, createSnackbar, dispatch, event, invite, notifyOrganizer, t]
	);

	const deleteRecurrentSerie = useCallback(
		(newMessage) => {
			let isCanceled = false;
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			const infoSnackbar = (hideButton = false) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'info',
					label: t('message.snackbar.appt_moved_to_trash', 'Appointment moved to trash'),
					autoHideTimeout: 3000,
					hideButton,
					actionLabel: 'Undo',
					onActionClick: () => {
						isCanceled = true;
					}
				});
			};

			infoSnackbar();

			setTimeout(() => {
				if (!isCanceled) {
					const ctxt = {
						dispatch,
						t,
						newMessage: newMessage?.text?.[0],
						isInstance: context.isInstance,
						createSnackbar
					};
					// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
					const deleteFunction = () =>
						!deleteAll
							? dispatch(
									modifyAppointment({
										invite: {
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
																			d: moment(event?.resource?.ridZ)
																				.subtract(1, 'day')
																				.format('YYYYMMDD')
																		}
																	]
																}
															]
														}
													]
												}
											]
										}
									})
							  )
							: deleteEvent(event, invite, ctxt);
					if (notifyOrganizer) {
						sendResponse(event, invite, ctxt).then(() => {
							deleteFunction().then((res: any) => {
								generateSnackbar({
									res,
									t: context.t,
									createSnackbar: context.createSnackbar,
									isTrash: true
								});
							});
						});
					} else {
						deleteFunction().then((res: any) => {
							generateSnackbar({
								res,
								t: context.t,
								createSnackbar: context.createSnackbar,
								isTrash: true
							});
						});
					}
				}
			}, 3000);
			context.onClose();
		},
		[context, createSnackbar, deleteAll, dispatch, event, invite, notifyOrganizer, t]
	);

	const deleteRecurrentInstance = useCallback(
		(newMessage) => {
			let isCanceled = false;
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			const infoSnackbar = (hideButton = false) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'info',
					label: t('message.snackbar.appt_moved_to_trash', 'Appointment moved to trash'),
					autoHideTimeout: 3000,
					hideButton,
					actionLabel: 'Undo',
					onActionClick: () => {
						isCanceled = true;
					}
				});
			};

			infoSnackbar();

			setTimeout(() => {
				if (!isCanceled) {
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
					if (notifyOrganizer) {
						sendResponse(event, invite, ctxt).then(() => {
							deleteEvent(event, invite, ctxt).then((res: any) => {
								generateSnackbar({
									res,
									t: context.t,
									createSnackbar: context.createSnackbar,
									isTrash: true
								});
							});
						});
					} else {
						deleteEvent(event, invite, ctxt);
					}
				}
			}, 3000);
			context.onClose();
		},
		[context, createSnackbar, dispatch, event, invite, notifyOrganizer, t]
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
