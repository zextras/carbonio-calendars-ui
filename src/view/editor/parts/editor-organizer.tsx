/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select, SelectItem } from '@zextras/carbonio-design-system';
import { find, map } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { normaliseContact } from '../../../normalizations/normalize-editor';
import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { selectEditorDisabled, selectOrganizer } from '../../../store/selectors/editor';
import { EditorProps, IdentityItem } from '../../../types/editor';

const convertIdentityItemToSelectItem = (identity: IdentityItem): SelectItem => ({
	...identity,
	value: identity?.value ? `${identity.value}` : identity.address
});

export const EditorOrganizer = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const identities = useIdentityItems();
	const organizer = useSelector(selectOrganizer(editorId));
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const normalizedOrganizer = normaliseContact(organizer);
	const { onOrganizerChange } = callbacks;
	const disabled = useSelector(selectEditorDisabled(editorId));

	const fromList = useMemo(() => {
		const identityList = map(identities, (identity) => convertIdentityItemToSelectItem(identity));
		if (find(identities, ['address', normalizedOrganizer?.address])) {
			return identityList;
		}
		if (normalizedOrganizer) {
			return [
				...identityList,
				{
					label: normalizedOrganizer?.fullName ?? normalizedOrganizer?.address,
					address: normalizedOrganizer?.address,
					fullName: normalizedOrganizer?.fullName ?? normalizedOrganizer?.address,
					type: 'sendAs',
					value: normalizedOrganizer?.address
				}
			];
		}
		return [];
	}, [identities, normalizedOrganizer]);

	const onChange = useCallback(
		(e) => {
			const newValue = find(fromList, ['value', e]);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			onOrganizerChange(newValue);
		},
		[fromList, onOrganizerChange]
	);

	return organizer ? (
		<Select
			items={fromList}
			label={t('placeholder.organizer', 'Organizer')}
			selection={convertIdentityItemToSelectItem(organizer)}
			onChange={onChange}
			disabled={disabled?.organizer}
		/>
	) : null;
};
