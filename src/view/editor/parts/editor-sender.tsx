/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Select, SingleSelectionOnChange } from '@zextras/carbonio-design-system';
import {
	getIdentitiesDescriptors,
	getIdentityDescription,
	IdentityDescriptor
} from '@zextras/carbonio-ui-commons';
import { find, map, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled } from '../../../store/selectors/editor';
import { editSender } from '../../../store/slices/editor-slice';
import { EditorProps, IdentityItem } from '../../../types/editor';

export const EditorSender = ({ editorId }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();
	const commonIdentities = useMemo<Array<IdentityDescriptor>>(() => getIdentitiesDescriptors(), []);

	const identities = map(commonIdentities, (item) => {
		const label = getIdentityDescription(item, t) ?? '';
		return {
			value: item.identityName,
			label,
			address: item.fromAddress,
			fullName: item.fromDisplay,
			type: item.type,
			identityName: item.identityName
		};
	});
	const selectIdentity = useCallback(
		(identityName: string) => find(identities, ['identityName', identityName]) ?? identities[0],
		[identities]
	);
	const [selection, setSelection] = useState<IdentityItem>(selectIdentity('DEFAULT'));

	const onChange = useCallback<SingleSelectionOnChange>(
		(e) => {
			if (e) {
				const newValue = selectIdentity(e);
				setSelection(newValue);
				dispatch(
					editSender({
						id: editorId,
						sender: { email: newValue.address, fullName: newValue.fullName }
					})
				);
			}
		},
		[selectIdentity, dispatch, editorId]
	);

	const fromLabel = useMemo(() => upperFirst(t('label.from', 'From')), [t]);
	return selection ? (
		<Select
			items={identities}
			label={fromLabel}
			selection={selection}
			onChange={onChange}
			disabled={disabled?.organizer}
		/>
	) : null;
};
