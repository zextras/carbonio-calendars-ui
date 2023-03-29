/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useCallback } from 'react';
import { t } from '@zextras/carbonio-shell-ui';
import { useAppSelector } from '../../../hooks/redux';
import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { selectEditorDisabled, selectOrganizer } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

export const EditorOrganizer = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const identities = useIdentityItems();
	const organizer = useAppSelector(selectOrganizer(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const { onOrganizerChange } = callbacks;

	const onChange = useCallback(
		(e) => {
			const newValue = find(identities, ['value', e]) ?? organizer;
			onOrganizerChange(newValue);
		},
		[identities, onOrganizerChange, organizer]
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
