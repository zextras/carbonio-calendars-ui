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

export const useOnSaveAndOnSend = (id, close) => {
	const dispatch = useDispatch();
	const account = useUserAccount();
	const closeBoard = useRemoveCurrentBoard();
	const editor = useSelector((state) => selectEditor(state, id));

	const saveAppointment = useCallback(
		() =>
			startsWith(editor?.resource?.id, 'new')
				? createAppointment({ editor, account })
				: modifyAppointment({ editor, account }),
		[account, editor]
	);

	const closePanel = useCallback(() => {
		close ? replaceHistory('/view') : closeBoard();
	}, [close, closeBoard]);

	const onSave = useCallback(() => {
		dispatch(editAppointmentData({ id, mod: { resource: { draft: true } } }));
		close ? close() : closePanel();
		dispatch(saveAppointment());
	}, [close, closePanel, dispatch, id, saveAppointment]);

	const onSend = useCallback(() => {
		dispatch(
			editAppointmentData({ id, mod: { resource: { draft: false, inviteNeverSent: false } } })
		);
		dispatch(saveAppointment());
		close ? close() : closePanel();
	}, [close, closePanel, dispatch, id, saveAppointment]);

	return {
		onSave,
		onSend
	};
};
