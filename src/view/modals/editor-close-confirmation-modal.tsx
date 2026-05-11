/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, CustomModal, Text } from '@zextras/carbonio-design-system';
import { addBoard, t } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDAR_BOARD_ID } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectEditor, selectPendingCloseConfirmation } from '../../store/selectors/editor';
import { clearPendingCloseConfirmation } from '../../store/slices/editor-slice';

export const EditorCloseConfirmationModal = (): React.JSX.Element => {
	const pendingConfirmation = useAppSelector(selectPendingCloseConfirmation);
	const editor = useAppSelector(selectEditor(pendingConfirmation?.editorId ?? ''));
	const dispatch = useAppDispatch();

	const title = useMemo(() => t('label.close_appointment_editor', 'Close appointment editor'), []);

	const message = useMemo(
		() =>
			t(
				'message.close_appointment_editor_confirmation',
				'Are you sure you want to close the appointment editor? If you close it without saving, you will lose the unsaved data.'
			),
		[]
	);

	const confirmLabel = useMemo(() => t('label.yes_close', 'Yes, close'), []);
	const cancelLabel = useMemo(() => t('label.cancel', 'Cancel'), []);

	const onConfirmClose = useCallback(() => {
		dispatch(clearPendingCloseConfirmation());
	}, [dispatch]);

	const onCancelClose = useCallback(() => {
		if (pendingConfirmation && editor) {
			addBoard({
				boardViewId: CALENDAR_BOARD_ID,
				title: pendingConfirmation.boardTitle || editor.title || '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		}
		dispatch(clearPendingCloseConfirmation());
	}, [dispatch, editor, pendingConfirmation]);

	return (
		<CustomModal open={!!pendingConfirmation} size="small" onClose={onCancelClose}>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader title={title} onClose={onCancelClose} />
				<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
					<Text overflow="break-word">{message}</Text>
				</Container>
				<ModalFooter
					onConfirm={onConfirmClose}
					label={confirmLabel}
					secondaryAction={onCancelClose}
					secondaryLabel={cancelLabel}
					secondaryBtnType="outlined"
					secondaryColor="primary"
					color="primary"
				/>
			</Container>
		</CustomModal>
	);
};
