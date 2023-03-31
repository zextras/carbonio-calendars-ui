/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectEditorClass, selectEditorDisabled } from '../../../store/selectors/editor';
import { editEditorClass } from '../../../store/slices/editor-slice';

type EditorPrivateCheckboxProps = {
	editorId: string;
};

export const EditorPrivateCheckbox = ({
	editorId
}: EditorPrivateCheckboxProps): ReactElement | null => {
	const [t] = useTranslation();
	const apptClass = useSelector(selectEditorClass(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

	const onClick = useCallback(() => {
		const newValue = apptClass === 'PRI' ? 'PUB' : 'PRI';
		dispatch(
			editEditorClass({
				id: editorId,
				class: newValue
			})
		);
	}, [apptClass, dispatch, editorId]);

	return (
		<Checkbox
			label={t('label.private', 'Private')}
			onClick={onClick}
			value={apptClass === 'PRI'}
			disabled={disabled?.private}
		/>
	);
};
