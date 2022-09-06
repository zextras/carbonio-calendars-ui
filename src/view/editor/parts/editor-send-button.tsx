/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, ModalManagerContext } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
	selectEditor,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorIsNew,
	selectEditorOptionalAttendees
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';
import { SeriesEditWarningModal } from '../../modals/series-edit-warning-modal';

export const EditorSendButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const [t] = useTranslation();
	const attendees = useSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useSelector(selectEditorOptionalAttendees(editorId));
	const isNew = useSelector(selectEditorIsNew(editorId));
	const editor = useSelector(selectEditor(editorId));
	const createModal = useContext(ModalManagerContext);
	const disabled = useSelector(selectEditorDisabled(editorId));

	const { onSend, closeCurrentEditor } = callbacks;
	const { action } = useParams<{ action: string }>();
	const isDisabled = useMemo(
		() => disabled?.sendButton || (!attendees?.length && !optionalAttendees?.length),
		[attendees?.length, disabled?.sendButton, optionalAttendees?.length]
	);
	const onClick = useCallback(() => {
		if (editor.isSeries && action === EventActionsEnum.EDIT && !editor.isInstance) {
			// It's ignore because the createModal Function is not typed
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const closeModal = createModal(
				{
					size: 'large',
					children: (
						<SeriesEditWarningModal
							action={onSend}
							isSending
							onClose={(): void => closeModal()}
							isNew={isNew}
							closeCurrentEditor={closeCurrentEditor}
							draft
						/>
					),
					onClose: () => {
						closeModal();
					}
				},
				true
			);
		} else
			onSend(isNew).then(({ response }) => {
				if (response) {
					closeCurrentEditor();
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
	}, [
		action,
		closeCurrentEditor,
		createModal,
		editor?.isInstance,
		editor?.isSeries,
		isNew,
		onSend,
		t
	]);

	return (
		<Button
			label={t('action.send', 'Send')}
			icon="PaperPlane"
			disabled={isDisabled}
			onClick={onClick}
		/>
	);
};
