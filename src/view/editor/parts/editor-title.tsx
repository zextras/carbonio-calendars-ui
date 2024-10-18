/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { debounce, isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorTitle } from '../../../store/selectors/editor';
import { editEditorTitle } from '../../../store/slices/editor-slice';

export const EditorTitle = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const title = useAppSelector(selectEditorTitle(editorId));
	const [value, setValue] = useState(title ?? '');
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();
	const boardUtilities = useBoardHooks();
	const updateBoard = boardUtilities?.updateBoard;

	useEffect(() => {
		if (title) {
			setValue(title);
		}
		const newBoardTitle = title?.length ? title : t('new_appointment', 'New appointment');
		updateBoard({ title: newBoardTitle });
	}, [t, title, updateBoard]);

	const debounceInput = useMemo(
		() =>
			debounce(
				(text) => {
					dispatch(editEditorTitle({ id: editorId, title: text }));
				},
				500,
				{
					trailing: true,
					leading: false
				}
			),
		[dispatch, editorId]
	);

	const onChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);
			debounceInput(e.target.value);
		},
		[debounceInput]
	);

	return !isNil(title) ? (
		<Input
			label={t('label.event_title', 'Event title')}
			value={value}
			onChange={onChange}
			disabled={disabled?.title}
			backgroundColor="gray5"
			data-testid="editor-title"
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus
		/>
	) : null;
};
