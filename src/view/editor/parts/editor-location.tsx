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
import { selectEditorLocation, selectEditorTitle } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorTitleProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const EditorLocation = ({
	editorId,
	callbacks,
	disabled = false
}: EditorTitleProps): JSX.Element | null => {
	const [t] = useTranslation();
	const location = useSelector(selectEditorLocation(editorId));
	const [value, setValue] = useState(location ?? '');
	const { onLocationChange } = callbacks;

	useEffect(() => {
		if (location) {
			setValue(location);
		}
	}, [location]);

	const throttleInput = useMemo(
		() =>
			throttle(onLocationChange, 500, {
				trailing: true,
				leading: false
			}),
		[onLocationChange]
	);

	const onChange = useCallback(
		(e) => {
			setValue(e.target.value);
			throttleInput(e.target.value);
		},
		[throttleInput]
	);

	return !isNil(location) ? (
		<Input
			label={t('label.location', 'Location')}
			value={value}
			onChange={onChange}
			disabled={disabled}
			backgroundColor="gray5"
		/>
	) : null;
};
