/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../hooks/redux';
import { selectEditorClass, selectEditorDisabled } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorPrivateCheckboxProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorPrivateCheckbox = ({
	editorId,
	callbacks
}: EditorPrivateCheckboxProps): ReactElement | null => {
	const [t] = useTranslation();
	const { onPrivateChange } = callbacks;
	const apptClass = useAppSelector(selectEditorClass(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const onClick = useCallback(() => {
		const newValue = apptClass === 'PRI' ? 'PUB' : 'PRI';
		onPrivateChange(newValue);
	}, [apptClass, onPrivateChange]);

	return (
		<Checkbox
			label={t('label.private', 'Private')}
			onClick={onClick}
			value={apptClass === 'PRI'}
			disabled={disabled?.private}
		/>
	);
};
