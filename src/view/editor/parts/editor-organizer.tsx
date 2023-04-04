/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { selectEditorDisabled, selectOrganizer } from '../../../store/selectors/editor';
import { editOrganizer } from '../../../store/slices/editor-slice';
import { EditorProps } from '../../../types/editor';

export const EditorOrganizer = ({ editorId }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const identities = useIdentityItems();
	const organizer = useSelector(selectOrganizer(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

	const onChange = useCallback(
		(e) => {
			const newValue = find(identities, ['value', e]) ?? organizer;
			dispatch(editOrganizer({ id: editorId, organizer: newValue }));
		},
		[dispatch, editorId, identities, organizer]
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
