/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRemoveCurrentBoard, replaceHistory, useUserAccount } from '@zextras/carbonio-shell-ui';
import { startsWith } from 'lodash';
import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { editAppointmentData } from '../store/slices/editor-slice';
import { selectEditor } from '../store/selectors/editor';
import { createAppointment } from '../store/actions/new-create-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
import { createApptException } from '../store/actions/create-appointment-exception';

export const useOnSaveAndOnSend = (id, isBoard, isInstance) => {
	const dispatch = useDispatch();
	const account = useUserAccount();
	const closeBoard = useRemoveCurrentBoard();
	const editor = useSelector((state) => selectEditor(state, id));
	const createSnackbar = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const [isIdle, setIsIdle] = useState(true);

	const saveAppointment = useCallback(
		(data) =>
			// eslint-disable-next-line no-nested-ternary
			isInstance
				? createApptException({ editor: data, account, orignalData: {} })
				: startsWith(editor?.resource?.id, 'new')
				? createAppointment({ editor: data, account })
				: modifyAppointment({ editor: data, account, isInstance }),
		[account, editor?.resource?.id, isInstance]
	);
	const closePanel = useCallback(() => {
		!isBoard ? replaceHistory('') : closeBoard();
	}, [isBoard, closeBoard]);

	const onSave = useCallback(() => {
		if (isIdle) {
			setIsIdle(false);
			dispatch(editAppointmentData({ id, mod: { resource: { draft: true } } }));
			dispatch(saveAppointment({ ...editor, resource: { ...editor.resource, draft: true } })).then(
				(res) => {
					if (res?.type) {
						const success = res.type.includes('fulfilled');
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
					setIsIdle(true);
				}
			);
		}
	}, [isIdle, dispatch, id, saveAppointment, editor, createSnackbar, t]);

	const onSend = useCallback(() => {
		dispatch(
			editAppointmentData({ id, mod: { resource: { draft: false, inviteNeverSent: false } } })
		);
		dispatch(saveAppointment({ ...editor, resource: { ...editor.resource, draft: false } }));
		closePanel();
	}, [closePanel, dispatch, id, saveAppointment, editor]);

	return {
		onSave,
		onSend
	};
};
