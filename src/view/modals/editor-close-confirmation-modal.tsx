/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { addBoard, t } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDAR_BOARD_ID } from '../../constants';
import { useAppSelector } from '../../store/redux/hooks';
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
	const createSnackbar = useSnackbar();
	const title = useMemo(() => t('label.close_appointment_editor', 'Unsaved changes'), []);
	const message = useMemo(
		() =>
			t(
				'message.close_appointment_editor_confirmation',
				'Your appointment has unsaved changes. Are you sure you want to close the editor and discard them?'
			),
		[]
	);

	const discardChangesLabel = useMemo(() => t('label.discard_changes', 'Discard changes'), []);
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

	const onDiscardChanges = useCallback(() => {
		onClose();

		createSnackbar({
			key: 'discard-changes',
			replace: true,
			severity: 'info',
			label: t('label.discard_changes_confirmation', 'Appointment changes discarded'),
			actionLabel: t('label.undo', 'Undo'),
			onActionClick: () => {
				onKeepEditing();
			},
			autoHideTimeout: 3000
		});
	}, [createSnackbar, onClose, onKeepEditing]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onKeepEditing} />
			<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
				<Text overflow="break-word">{message}</Text>
			</Container>
			<ModalFooter
				onConfirm={onDiscardChanges}
				label={discardChangesLabel}
				secondaryAction={onKeepEditing}
				secondaryLabel={keepEditingLabel}
				secondaryBtnType="outlined"
				secondaryColor="primary"
				color="primary"
			/>
		</Container>
	);
};
