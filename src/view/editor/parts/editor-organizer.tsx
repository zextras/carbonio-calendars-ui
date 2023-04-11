/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectOrganizer } from '../../../store/selectors/editor';
import { editOrganizer } from '../../../store/slices/editor-slice';
import { EditorProps } from '../../../types/editor';

export const EditorOrganizer = ({ editorId }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const identities = useIdentityItems();
	const organizer = useAppSelector(selectOrganizer(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const onChange = useCallback(
		(e) => {
			const newValue = find(identities, ['value', e]) ?? organizer;
			dispatch(editOrganizer({ id: editorId, organizer: newValue }));
		},
		[identities, organizer, dispatch, editorId]
	);

	return organizer ? (
		<Select
			items={identities}
			label={t('placeholder.organizer', 'Organizer')}
			selection={organizer}
			onChange={onChange}
			disabled={disabled?.organizer}
		/>
	) : null;
};
