/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { selectOrganizer } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

export const EditorOrganizer = ({ editorId, callbacks }: EditorProps): JSX.Element | null => {
	const [t] = useTranslation();
	const identities = useIdentityItems();
	const organizer = useSelector(selectOrganizer(editorId));
	const { onOrganizerChange } = callbacks;

	return organizer ? (
		<Select
			items={identities}
			label={t('placeholder.organizer', 'Organizer')}
			selection={organizer}
			onChange={onOrganizerChange}
		/>
	) : null;
};
