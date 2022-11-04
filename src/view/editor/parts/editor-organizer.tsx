/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select, SelectItem } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useIdentityItems } from '../../../hooks/use-idenity-items';
import { normaliseContact } from '../../../normalizations/normalize-editor';
import { selectEditorDisabled, selectOrganizer } from '../../../store/selectors/editor';
import { EditorProps, IdentityItem } from '../../../types/editor';

const convertIdentityItemToSelectItem = (identity: IdentityItem): SelectItem => ({
	...identity,
	value: identity?.value ? `${identity.value}` : identity.address
});

export const EditorOrganizer = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const identities = useIdentityItems();
	const organizer: IdentityItem | { a: string; d: string; url: string } = useSelector(
		selectOrganizer(editorId)
	);
	// organizer reaching normaliseContact can't be of type IdentityItem
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const normalizedOrganizer = organizer.address ? organizer : normaliseContact(organizer);
	const { onOrganizerChange } = callbacks;
	const disabled = useSelector(selectEditorDisabled(editorId));

	const fromList = useMemo(() => {
		if (find(identities, ['address', normalizedOrganizer?.address])) {
			return identities;
		}
		if (normalizedOrganizer) {
			return [
				...identities,
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
		(e): void => {
			const newValue = find(fromList, ['value', parseInt(e, 10)]) ?? organizer;
			onOrganizerChange(newValue);
		},
		[fromList, organizer, onOrganizerChange]
	);

	const selectItems = useMemo(
		() => fromList.map((identity): SelectItem => convertIdentityItemToSelectItem(identity)),
		[fromList]
	);

	const selectedValue = useMemo(
		() => convertIdentityItemToSelectItem(normalizedOrganizer),
		[normalizedOrganizer]
	);

	return organizer ? (
		<Select
			items={selectItems}
			label={t('placeholder.organizer', 'Organizer')}
			selection={selectedValue}
			onChange={onChange}
			disabled={disabled?.organizer}
		/>
	) : null;
};
