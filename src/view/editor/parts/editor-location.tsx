/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { isNil, debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorLocation } from '../../../store/selectors/editor';
import { editEditorLocation } from '../../../store/slices/editor-slice';

export const EditorLocation = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const location = useAppSelector(selectEditorLocation(editorId));
	const [value, setValue] = useState(location ?? '');
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (location) {
			setValue(location);
		}
	}, [location]);

	const debounceInput = useMemo(
		() =>
			debounce(
				(loc) => {
					dispatch(editEditorLocation({ id: editorId, location: loc }));
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
		(e: React.ChangeEvent<HTMLInputElement>) => {
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
