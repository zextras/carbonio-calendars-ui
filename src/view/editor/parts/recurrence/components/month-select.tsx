/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { differenceWith, find, isEqual } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';

type MonthSelectProps = {
	value: { label: string; value: string };
	setValue: React.Dispatch<React.SetStateAction<{ label: string; value: string }>>;
	onChange: (ev: number) => void;
	disabled: boolean;
};

export const MonthSelect = ({
	value,
	setValue,
	onChange,
	disabled
}: MonthSelectProps): ReactElement => {
	const months = useMemo(
		() => [
			{ label: t('months.january', 'January'), value: '1' },
			{ label: t('months.february', 'February'), value: '2' },
			{ label: t('months.march', 'March'), value: '3' },
			{ label: t('months.april', 'April'), value: '4' },
			{ label: t('months.may', 'May'), value: '5' },
			{ label: t('months.june', 'June'), value: '6' },
			{ label: t('months.july', 'July'), value: '7' },
			{ label: t('months.august', 'August'), value: '8' },
			{ label: t('months.september', 'September'), value: '9' },
			{ label: t('months.october', 'October'), value: '10' },
			{ label: t('months.november', 'November'), value: '11' },
			{ label: t('months.december', 'December'), value: '12' }
		],
		[]
	);

	const onMonthChange = useCallback(
		(ev) => {
			if (ev) {
				const molist = Number(ev);
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(months, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? months[0];
				setValue(newValue);
				onChange(molist);
			}
		},
		[months, onChange, setValue]
	);
	return (
		<Select
			items={months}
			label={t('label.month', 'Month')}
			onChange={onMonthChange}
			disablePortal
			width="fit"
			disabled={disabled}
			selection={value}
		/>
	);
};
