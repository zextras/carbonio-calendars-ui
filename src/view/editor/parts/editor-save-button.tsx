/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, ModalManagerContext } from '@zextras/carbonio-design-system';
import { getBridgedFunctions, t } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { StoreProvider } from '../../../store/redux';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';
import {
	selectEditor,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorIsNew,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { SeriesEditWarningModal } from '../../modals/series-edit-warning-modal';

export const EditorSaveButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const title = useSelector(selectEditorTitle(editorId));
	const isNew = useSelector(selectEditorIsNew(editorId));
	const editor = useSelector(selectEditor(editorId));
	const createModal = useContext(ModalManagerContext);
	const disabled = useSelector(selectEditorDisabled(editorId));
	const attendeesLength = useSelector(selectEditorAttendees)?.length;

	const { onSave } = callbacks;
	const { action } = useParams<{ action: string }>();

	const onClick = useCallback(() => {
		if (editor.isSeries && action === EventActionsEnum.EDIT && !editor.isInstance) {
			// It's ignore because the createModal Function is not typed
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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
			onSave({ draft: !attendeesLength, isNew }).then(({ response }) => {
				getBridgedFunctions().createSnackbar({
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
	}, [
		editor.isSeries,
		editor.isInstance,
		action,
		onSave,
		attendeesLength,
		isNew,
		createModal,
		editorId
	]);

	return (
		<Button
			label={t('label.save', 'Save')}
			icon="SaveOutline"
			disabled={disabled?.saveButton ?? !title?.length}
			onClick={onClick}
			type="outlined"
		/>
	);
};
