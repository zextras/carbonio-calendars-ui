/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Button, Tooltip, useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { closeBoard, useBoard } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { useEditorSendButtonState } from './editor-button-hooks';
import { onSend } from 'commons/editor-save-send-fns';
import { CALENDAR_ROUTE } from 'constants/index';
import { StoreProvider } from 'store/redux';
import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import { selectEditor, selectEditorIsNew } from 'store/selectors/editor';
import { EditorProps } from 'types/editor';
import { SeriesEditWarningModal } from 'view/modals/series-edit-warning-modal';

export const EditorSendButton = ({ editorId }: EditorProps): ReactElement => {
	const isNew = useAppSelector(selectEditorIsNew(editorId));
	const editor = useAppSelector(selectEditor(editorId));
	const { createModal, closeModal } = useModal();
	const createSnackbar = useSnackbar();
	const board = useBoard();
	const dispatch = useAppDispatch();
	const { replaceHistory } = useHistoryNavigation();
	const { isDisabled: isSendDisabled, tooltip: disabledTooltipLabel } =
		useEditorSendButtonState(editorId);
	const [t] = useTranslation();

	const onClick = useCallback(() => {
		if (editor.isSeries && !isNew && !editor.isInstance) {
			const modalId = 'series-edit-warning';
			createModal(
				{
					id: modalId,
					size: 'large',
					children: (
						<StoreProvider>
							<SeriesEditWarningModal
								action={onSend}
								isSending
								onClose={(): void => closeModal(modalId)}
								isNew={isNew}
								editorId={editorId}
								editor={editor}
							/>
						</StoreProvider>
					),
					onClose: () => {
						closeModal(modalId);
					}
				},
				true
			);
		} else
			onSend({ isNew, editor, dispatch }).then(({ response }) => {
				if (editor?.panel && response) {
					replaceHistory(`/${CALENDAR_ROUTE}`);
				}
				if (board && response) {
					closeBoard(board?.id);
				}
				createSnackbar({
					key: `calendar-moved-root`,
					replace: true,
					severity: response ? 'info' : 'warning',
					hideButton: true,
					label: !response
						? t('label.error_try_again', 'Something went wrong, please try again')
						: t('message.appointment_invitation_sent', 'Appointment invitation sent'),
					autoHideTimeout: 3000
				});
			});
	}, [
		board,
		closeModal,
		createModal,
		createSnackbar,
		dispatch,
		editor,
		editorId,
		isNew,
		replaceHistory,
		t
	]);

	return (
		<Tooltip label={disabledTooltipLabel} disabled={!isSendDisabled}>
			<Button
				label={t('action.send', 'Send')}
				icon="PaperPlane"
				disabled={isSendDisabled}
				onClick={onClick}
			/>
		</Tooltip>
	);
};
