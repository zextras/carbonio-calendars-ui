/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isNil, debounce } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@zextras/carbonio-design-system';
import { selectEditorDisabled, selectEditorLocation } from '../../../store/selectors/editor';
import { editEditorLocation } from '../../../store/slices/editor-slice';

type EditorTitleProps = {
	editorId: string;
};

export const EditorLocation = ({ editorId }: EditorTitleProps): ReactElement | null => {
	const [t] = useTranslation();
	const location = useSelector(selectEditorLocation(editorId));
	const [value, setValue] = useState(location ?? '');
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

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
