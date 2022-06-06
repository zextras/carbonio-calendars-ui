/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditorClass } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorPrivateCheckboxProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const EditorPrivateCheckbox = ({
	editorId,
	callbacks,
	disabled = false
}: EditorPrivateCheckboxProps): JSX.Element | null => {
	const [t] = useTranslation();
	const { onPrivateChange } = callbacks;
	const apptClass = useSelector(selectEditorClass(editorId));

	return (
		<Checkbox
			label={t('label.private', 'Private')}
			onChange={onPrivateChange}
			checked={apptClass === 'PRI'}
			disabled={disabled}
		/>
	);
};
