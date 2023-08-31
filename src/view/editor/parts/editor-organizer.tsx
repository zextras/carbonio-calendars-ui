/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { find, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectSender } from '../../../store/selectors/editor';
import { editSender } from '../../../store/slices/editor-slice';
import { EditorProps } from '../../../types/editor';

export const EditorOrganizer = ({ editorId }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const identities = useIdentityItems();
	const sender = useAppSelector(selectSender(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const onChange = useCallback(
		(e) => {
			const newValue = find(identities, ['value', e]) ?? sender;
			dispatch(editSender({ id: editorId, sender: newValue }));
		},
		[identities, sender, dispatch, editorId]
	);

	const fromLabel = useMemo(() => upperFirst(t('label.from', 'From')), [t]);
	return sender ? (
		<Select
			items={identities}
			label={fromLabel}
			selection={sender}
			onChange={onChange}
			disabled={disabled?.organizer}
		/>
	) : null;
};
