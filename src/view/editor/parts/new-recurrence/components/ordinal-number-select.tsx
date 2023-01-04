/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { differenceWith, find, isEqual } from 'lodash';
import React, { useCallback, useMemo } from 'react';

export const OrdinalNumberSelect = ({
	value,
	setValue,
	onChange,
	disabled
}) => {
	const ordinalNumbers = useMemo(
		() => [
			{ label: t('items.first', 'First'), value: '1' },
			{ label: t('items.second', 'Second'), value: '2' },
			{ label: t('items.third', 'Third'), value: '3' },
			{ label: t('items.fourth', 'Fourth'), value: '4' },
			{ label: t('items.last', 'Last'), value: '-1' }
		],
		[]
	);

	const onBySetPosChange = useCallback(
		(ev) => {
			if (ev) {
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(ordinalNumbers, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? ordinalNumbers[0];
				setValue(newValue);
				onChange(ev);
			}
		},
		[onChange, ordinalNumbers, setValue]
	);

	return (
		<Select
			items={ordinalNumbers}
			label={t('label.number', 'Number')}
			onChange={onBySetPosChange}
			disablePortal
			width="fit"
			disabled={disabled}
			selection={value}
		/>
	);
};
