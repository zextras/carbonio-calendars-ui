/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { addBoard, t } from '@zextras/carbonio-shell-ui';

import { onSave } from '../../commons/editor-save-send-fns';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDAR_BOARD_ID } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectEditor } from '../../store/selectors/editor';

type EditorCloseConfirmationModalProps = {
	editorId: string;
	boardTitle: string;
	onClose: () => void;
};

export const EditorCloseConfirmationModal = ({
	editorId,
	boardTitle,
	onClose
}: EditorCloseConfirmationModalProps): React.JSX.Element => {
	const editor = useAppSelector(selectEditor(editorId));
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();
	const [isSaving, setIsSaving] = useState(false);

	const title = useMemo(() => t('label.close_appointment_editor', 'Unsaved changes'), []);

	const message = useMemo(
		() =>
			t(
				'message.close_appointment_editor_confirmation',
				'Your appointment has unsaved changes. Closing the editor now will discard them.'
			),
		[]
	);

	const saveAndCloseLabel = useMemo(() => t('label.save_and_close', 'Save and close'), []);
	const keepEditingLabel = useMemo(() => t('label.keep_editing', 'Keep editing'), []);

	const onKeepEditing = useCallback(() => {
		if (editor) {
			addBoard({
				boardViewId: CALENDAR_BOARD_ID,
				title: boardTitle || editor.title || '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		}
		onClose();
	}, [boardTitle, editor, onClose]);

	const onSaveAndClose = useCallback(() => {
		if (!editor) return;
		setIsSaving(true);
		onSave({
			draft: false,
			isNew: editor.isNew,
			editor,
			dispatch
		}).then(({ response }: { response: unknown }) => {
			createSnackbar({
				key: 'editor-close-save',
				replace: true,
				severity: response ? 'info' : 'warning',
				hideButton: true,
				label: response
					? t('message.snackbar.calendar_edits_saved', 'Edits saved correctly')
					: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000
			});
			setIsSaving(false);
			if (response) {
				onClose();
			}
		});
	}, [createSnackbar, dispatch, editor, onClose]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} />
			<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
				<Text overflow="break-word">{message}</Text>
			</Container>
			<ModalFooter
				onConfirm={onSaveAndClose}
				label={saveAndCloseLabel}
				secondaryAction={onKeepEditing}
				secondaryLabel={keepEditingLabel}
				secondaryBtnType="outlined"
				secondaryColor="primary"
				color="primary"
				loading={isSaving}
				disabled={isSaving}
			/>
		</Container>
	);
};
