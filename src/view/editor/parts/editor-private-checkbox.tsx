/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Checkbox } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorClass, selectEditorDisabled } from '../../../store/selectors/editor';
import { editEditorClass } from '../../../store/slices/editor-slice';

export const EditorPrivateCheckbox = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const apptClass = useAppSelector(selectEditorClass(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));

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
