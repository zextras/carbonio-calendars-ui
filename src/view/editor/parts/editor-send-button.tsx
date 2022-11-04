/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, ModalManagerContext } from '@zextras/carbonio-design-system';
import {
	closeBoard,
	getBridgedFunctions,
	replaceHistory,
	t,
	useBoard
} from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { StoreProvider } from '../../../store/redux';
import {
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorIsInstance,
	selectEditorIsNew,
	selectEditorIsSeries,
	selectEditorOptionalAttendees,
	selectEditorPanel
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';
import { SeriesEditWarningModal } from '../../modals/series-edit-warning-modal';

export const EditorSendButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const attendees = useSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useSelector(selectEditorOptionalAttendees(editorId));
	const isSeries = useSelector(selectEditorIsSeries(editorId));
	const isInstance = useSelector(selectEditorIsInstance(editorId));
	const panel = useSelector(selectEditorPanel(editorId));
	const isNew = useSelector(selectEditorIsNew(editorId));
	const createModal = useContext(ModalManagerContext);
	const disabled = useSelector(selectEditorDisabled(editorId));

	const board = useBoard();

	const { onSend } = callbacks;
	const { action } = useParams<{ action: string }>();
	const isDisabled = useMemo(
		() => disabled?.sendButton || (!attendees?.length && !optionalAttendees?.length),
		[attendees?.length, disabled?.sendButton, optionalAttendees?.length]
	);
	const onClick = useCallback(() => {
		if (isSeries && action === EventActionsEnum.EDIT && !isInstance) {
			// It's ignore because the createModal Function is not typed
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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
			onSend(isNew).then(({ response }) => {
				if (panel && response) {
					replaceHistory('');
				} else if (board) {
					closeBoard(board?.id);
				}
				getBridgedFunctions().createSnackbar({
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
	}, [action, board, createModal, editorId, isInstance, isNew, isSeries, onSend, panel]);

	return (
		<Button
			label={t('action.send', 'Send')}
			icon="PaperPlane"
			disabled={isDisabled}
			onClick={onClick}
		/>
	);
};
