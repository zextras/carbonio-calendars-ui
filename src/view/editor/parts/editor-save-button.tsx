/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Button, useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { onSave } from '../../../commons/editor-save-send-fns';
import { StoreProvider } from '../../../store/redux';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditor,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorEquipment,
	selectEditorIsNew,
	selectEditorMeetingRoom,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { SeriesEditWarningModal } from '../../modals/series-edit-warning-modal';

export const EditorSaveButton = ({ editorId }: EditorProps): ReactElement => {
	const title = useAppSelector(selectEditorTitle(editorId));
	const isNew = useAppSelector(selectEditorIsNew(editorId));
	const editor = useAppSelector(selectEditor(editorId));
	const createModal = useModal();
	const createSnackbar = useSnackbar();
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const attendeesLength = useAppSelector(selectEditorAttendees(editorId))?.length;
	const meetingRoomLength = useAppSelector(selectEditorMeetingRoom(editorId))?.length;
	const equipmentsLength = useAppSelector(selectEditorEquipment(editorId))?.length;

	const [t] = useTranslation();
	const dispatch = useAppDispatch();

	const onClick = useCallback(() => {
		if (editor.isSeries && !isNew && !editor.isInstance) {
			const closeModal = createModal(
				{
					size: 'large',
					children: (
						<StoreProvider>
							<SeriesEditWarningModal
								action={onSave}
								isSending={false}
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
		} else {
			onSave({
				draft: !!attendeesLength || !!meetingRoomLength || !!equipmentsLength,
				isNew,
				editor,
				dispatch
			}).then(({ response }) => {
				createSnackbar({
					key: `calendar-moved-root`,
					replace: true,
					type: response ? 'info' : 'warning',
					hideButton: true,
					label: !response
						? t('label.error_try_again', 'Something went wrong, please try again')
						: t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
					autoHideTimeout: 3000
				});
			});
		}
	}, [
		editor,
		isNew,
		createModal,
		editorId,
		attendeesLength,
		meetingRoomLength,
		equipmentsLength,
		dispatch,
		createSnackbar,
		t
	]);

	return (
		<Button
			label={t('label.save', 'Save')}
			icon="SaveOutline"
			disabled={disabled?.saveButton || !title?.length}
			onClick={onClick}
			type="outlined"
		/>
	);
};
