/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRemoveCurrentBoard, replaceHistory, useUserAccount } from '@zextras/carbonio-shell-ui';
import { startsWith } from 'lodash';
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
	// createAppointmentExceptionRequest

	// const saveAppointment = useCallback(
	// 	(data) =>
	// 		// eslint-disable-next-line no-nested-ternary
	// 		!isSeries
	// 			? createApptException({ editor: data, account, isSeries })
	// 			: startsWith(editor?.resource?.id, 'new')
	// 			? createAppointment({ editor: data, account })
	// 			: modifyAppointment({ editor: data, account, isSeries }),
	// 	[account, editor?.resource?.id, isSeries]
	// );
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
		dispatch(editAppointmentData({ id, mod: { resource: { draft: true } } }));
		closePanel();
		dispatch(saveAppointment({ ...editor, resource: { ...editor.resource, draft: true } }));
	}, [closePanel, dispatch, id, saveAppointment, editor]);

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
