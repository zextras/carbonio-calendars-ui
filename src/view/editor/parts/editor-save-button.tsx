/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, ModalManagerContext } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { onSave } from '../../../commons/editor-save-send-fns';
import { StoreProvider } from '../../../store/redux';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
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

export const EditorSaveButton = ({ editorId }: EditorProps): ReactElement => {
	const title = useAppSelector(selectEditorTitle(editorId));
	const isNew = useAppSelector(selectEditorIsNew(editorId));
	const editor = useAppSelector(selectEditor(editorId));
	const createModal = useContext(ModalManagerContext);
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const attendeesLength = useAppSelector(selectEditorAttendees(editorId))?.length;
	const [t] = useTranslation();
	const dispatch = useAppDispatch();

	const { action } = useParams<{ action: string }>();

	const onClick = useCallback(() => {
		if (editor.isSeries && action === EventActionsEnum.EDIT && !editor.isInstance) {
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
			onSave({ draft: !!attendeesLength, isNew, editor, dispatch }).then(({ response }) => {
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
		}
	}, [editor, action, attendeesLength, isNew, dispatch, createModal, editorId, t]);

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
