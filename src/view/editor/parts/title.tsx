/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isNil, throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Input } from '@zextras/carbonio-design-system';
import { selectEditorTitle } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorTitleProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const EditorTitle = ({
	editorId,
	callbacks,
	disabled = false
}: EditorTitleProps): JSX.Element | null => {
	const [t] = useTranslation();
	const title = useSelector(selectEditorTitle(editorId));
	const [value, setValue] = useState(title ?? '');
	const { onSubjectChange } = callbacks;

	useEffect(() => {
		if (title) {
			setValue(title);
		}
	}, [title]);

	const throttleInput = useMemo(
		() =>
			throttle(onSubjectChange, 500, {
				trailing: true,
				leading: false
			}),
		[onSubjectChange]
	);

	const onChange = useCallback(
		(e) => {
			setValue(e.target.value);
			throttleInput(e);
		},
		[throttleInput]
	);

	return !isNil(title) ? (
		<Input
			label={t('label.event_title', 'Event title')}
			value={value}
			onChange={onChange}
			disabled={disabled}
			backgroundColor="gray5"
		/>
	) : null;
};
