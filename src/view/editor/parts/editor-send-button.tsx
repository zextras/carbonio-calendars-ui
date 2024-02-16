/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Button, useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { closeBoard, replaceHistory, useBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { onSend } from '../../../commons/editor-save-send-fns';
import { StoreProvider } from '../../../store/redux';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditor,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorEquipment,
	selectEditorIsNew,
	selectEditorMeetingRoom,
	selectEditorOptionalAttendees,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { SeriesEditWarningModal } from '../../modals/series-edit-warning-modal';

export const EditorSendButton = ({ editorId }: EditorProps): ReactElement => {
	const attendees = useAppSelector(selectEditorAttendees(editorId));
	const title = useAppSelector(selectEditorTitle(editorId));
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const meetingRooms = useAppSelector(selectEditorMeetingRoom(editorId));
	const equipments = useAppSelector(selectEditorEquipment(editorId));

	const isNew = useAppSelector(selectEditorIsNew(editorId));
	const editor = useAppSelector(selectEditor(editorId));
	const createModal = useModal();
	const createSnackbar = useSnackbar();

	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const [t] = useTranslation();
	const board = useBoard();
	const dispatch = useAppDispatch();

	const isDisabled = useMemo(
		() =>
			disabled?.sendButton ||
			(!attendees?.length &&
				!optionalAttendees?.length &&
				!meetingRooms?.length &&
				!equipments?.length) ||
			!title?.length,
		[
			attendees?.length,
			disabled?.sendButton,
			equipments?.length,
			meetingRooms?.length,
			optionalAttendees?.length,
			title?.length
		]
	);
	const onClick = useCallback(() => {
		if (editor.isSeries && !isNew && !editor.isInstance) {
			const closeModal = createModal(
				{
					size: 'large',
					children: (
						<StoreProvider>
							<SeriesEditWarningModal
								action={onSend}
								isSending
								onClose={(): void => closeModal()}
								isNew={isNew}
								editorId={editorId}
								editor={editor}
							/>
						</StoreProvider>
					),
					onClose: () => {
						closeModal();
					}
				},
				true
			);
		} else
			onSend({ isNew, editor, dispatch }).then(({ response }) => {
				if (editor?.panel && response) {
					replaceHistory('');
				}
				if (board && response) {
					closeBoard(board?.id);
				}
				createSnackbar({
					key: `calendar-moved-root`,
					replace: true,
					type: response ? 'info' : 'warning',
					hideButton: true,
					label: !response
						? t('label.error_try_again', 'Something went wrong, please try again')
						: t('message.appointment_invitation_sent', 'Appointment invitation sent'),
					autoHideTimeout: 3000
				});
			});
	}, [board, createModal, createSnackbar, dispatch, editor, editorId, isNew, t]);

	return (
		<Button
			label={t('action.send', 'Send')}
			icon="PaperPlane"
			disabled={isDisabled}
			onClick={onClick}
		/>
	);
};
