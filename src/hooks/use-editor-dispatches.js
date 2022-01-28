/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	useReplaceHistoryCallback,
	useRemoveCurrentBoard,
	useUserAccounts
} from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import { useCallback, useContext, useMemo } from 'react';
import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { throttle } from 'lodash';
import { uploadParts } from '../store/actions/upload-parts';
import {
	editAppointmentData,
	editResourceData,
	editAttendees,
	editOptionalAttendees
} from '../store/slices/editor-slice';
import { proposeNewTime } from '../store/actions/propose-new-time';
import { useOnSaveAndOnSend } from './use-onsave-and-onsend';

export const useEditorDispatches = (id, isBoard = false) => {
	const replaceHistory = useReplaceHistoryCallback();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const closeBoard = useRemoveCurrentBoard();
	const accounts = useUserAccounts();
	const { onSave, onSend } = useOnSaveAndOnSend(id, isBoard);

	const onSubjectChange = useMemo(
		() =>
			throttle((e) => dispatch(editAppointmentData({ id, mod: { title: e.target.value } })), 250, {
				trailing: true,
				leading: false
			}),
		[dispatch, id]
	);
	const onLocationChange = useMemo(
		() =>
			throttle(
				(e) =>
					dispatch(editAppointmentData({ id, mod: { resource: { location: e.target.value } } })),
				250,
				{
					trailing: true,
					leading: false
				}
			),
		[dispatch, id]
	);
	const onOrganizerChange = useCallback(
		(data) => dispatch(editAppointmentData({ id, mod: { resource: { organizer: data } } })),
		[dispatch, id]
	);
	const closePanel = useCallback(() => {
		!isBoard ? replaceHistory('') : closeBoard();
	}, [isBoard, closeBoard, replaceHistory]);

	const uploadAttachments = useCallback((files) => dispatch(uploadParts({ files })), [dispatch]);

	const onProposeNewTime = useCallback(() => {
		dispatch(
			editAppointmentData({ id, mod: { resource: { draft: false, inviteNeverSent: false } } })
		);
		dispatch(proposeNewTime({ id, draft: false, accounts })).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `new-time-proposed`,
					replace: true,
					type: 'success',
					hideButton: true,
					label: t('snackbar.new_time_proposed_success', 'New time proposed'),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `new-time-proposed-error`,
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
		closePanel();
	}, [accounts, closePanel, dispatch, id, createSnackbar, t]);

	const onDateChange = useCallback(
		(mod) => dispatch(editAppointmentData({ id, mod })),
		[dispatch, id]
	);
	const onAttachmentsChange = useCallback(
		(attach, file) =>
			dispatch(
				editResourceData({
					id,
					mod: { attach, attachmentFiles: file }
				})
			),
		[dispatch, id]
	);
	const onPrivateChange = useCallback(
		(isPrivate) =>
			dispatch(
				editAppointmentData({
					id,
					mod: { resource: { class: isPrivate ? 'PRI' : 'PUB', isPrivate } }
				})
			),
		[dispatch, id]
	);
	const onCalendarChange = useCallback(
		(calendar) =>
			dispatch(
				editAppointmentData({
					id,
					mod: {
						resource: {
							calendar: {
								id: calendar.id,
								name: calendar.name,
								color: calendar.color
							}
						}
					}
				})
			),
		[dispatch, id]
	);
	const onDisplayStatusChange = useCallback(
		(freeBusy) => dispatch(editAppointmentData({ id, mod: { resource: { freeBusy } } })),
		[dispatch, id]
	);
	const onReminderChange = useCallback(
		(value) =>
			dispatch(
				editAppointmentData({
					id,
					mod: {
						resource:
							value === 'never'
								? { alarm: null, hasAlarm: false }
								: { alarm: value, hasAlarm: true }
					}
				})
			),
		[dispatch, id]
	);
	const onAllDayChange = useCallback(
		(allDay) => dispatch(editAppointmentData({ id, mod: { allDay } })),
		[dispatch, id]
	);

	const onTimeZoneChange = useCallback(
		(startTimeZone) => dispatch(editAppointmentData({ id, mod: { startTimeZone } })),
		[dispatch, id]
	);
	const onToggleRichText = useCallback(
		(isRichText) => {
			dispatch(editAppointmentData({ id, mod: { resource: { isRichText } } }));
		},
		[dispatch, id]
	);

	const onTextChange = useMemo(
		() =>
			throttle(
				([plainText, richText]) =>
					dispatch(editAppointmentData({ id, mod: { resource: { richText, plainText } } })),
				250,
				{
					trailing: true,
					leading: false
				}
			),
		[dispatch, id]
	);

	const onAttendeesChange = useCallback(
		(attendees) => dispatch(editAttendees({ id, attendees })),
		[dispatch, id]
	);

	const onRecurrenceChange = useCallback(
		(val) => dispatch(editResourceData({ id, mod: { recur: val } })),
		[dispatch, id]
	);

	const onAttendeesOptionalChange = useCallback(
		(optionalAttendees) => dispatch(editOptionalAttendees({ id, optionalAttendees })),
		[dispatch, id]
	);

	return {
		onPrivateChange,
		onCalendarChange,
		onDisplayStatusChange,
		onReminderChange,
		onSubjectChange,
		onLocationChange,
		onOrganizerChange,
		onSave,
		onSend,
		onDateChange,
		onTimeZoneChange,
		onAllDayChange,
		onToggleRichText,
		onTextChange,
		onAttendeesChange,
		onAttendeesOptionalChange,
		uploadAttachments,
		onAttachmentsChange,
		onRecurrenceChange,
		closePanel,
		onProposeNewTime
	};
};
