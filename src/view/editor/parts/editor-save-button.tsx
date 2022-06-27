/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditorIsNew, selectEditorTitle } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

export const EditorSaveButton = ({ editorId, callbacks }: EditorProps): JSX.Element => {
	const [t] = useTranslation();
	const title = useSelector(selectEditorTitle(editorId));
	const isNew = useSelector(selectEditorIsNew(editorId));
	const { onSave } = callbacks;

	const onClick = useCallback(() => {
		onSave({ draft: true, isNew }).then(({ response }) => {
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
	}, [isNew, onSave, t]);

	return (
		<Button
			label={t('label.save', 'Save')}
			icon="SaveOutline"
			disabled={!title?.length}
			onClick={onClick}
			type="outlined"
		/>
	);
};
