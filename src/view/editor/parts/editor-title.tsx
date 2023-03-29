/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Input } from '@zextras/carbonio-design-system';
import { debounce, isNil } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '@zextras/carbonio-shell-ui';
import { useAppSelector } from '../../../hooks/redux';
import { selectEditorDisabled, selectEditorTitle } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorTitleProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorTitle = ({ editorId, callbacks }: EditorTitleProps): ReactElement | null => {
	const title = useAppSelector(selectEditorTitle(editorId));
	const [value, setValue] = useState(title ?? '');
	const { onSubjectChange } = callbacks;
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	useEffect(() => {
		if (title) {
			setValue(title);
		}
	}, [title]);

	const debounceInput = useMemo(
		() =>
			debounce(onSubjectChange, 500, {
				trailing: true,
				leading: false
			}),
		[onSubjectChange]
	);

	const onChange = useCallback(
		(e) => {
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
		/>
	) : null;
};
