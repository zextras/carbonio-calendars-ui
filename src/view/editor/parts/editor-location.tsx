/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Input } from '@zextras/carbonio-design-system';
import { debounce, isNil } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../hooks/redux';
import { selectEditorDisabled, selectEditorLocation } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorTitleProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorLocation = ({ editorId, callbacks }: EditorTitleProps): ReactElement | null => {
	const [t] = useTranslation();
	const location = useAppSelector(selectEditorLocation(editorId));
	const [value, setValue] = useState(location ?? '');
	const { onLocationChange } = callbacks;
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	useEffect(() => {
		if (location) {
			setValue(location);
		}
	}, [location]);

	const debounceInput = useMemo(
		() =>
			debounce(onLocationChange, 500, {
				trailing: true,
				leading: false
			}),
		[onLocationChange]
	);

	const onChange = useCallback(
		(e) => {
			setValue(e.target.value);
			debounceInput(e.target.value);
		},
		[debounceInput]
	);

	return !isNil(location) ? (
		<Input
			label={t('label.location', 'Location')}
			value={value}
			onChange={onChange}
			disabled={disabled?.location}
			backgroundColor="gray5"
			data-testid="editor-location"
		/>
	) : null;
};
