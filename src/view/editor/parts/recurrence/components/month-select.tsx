/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { differenceWith, find, isEqual } from 'lodash';

import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';

type MonthSelectProps = {
	value: { label: string; value: string };
	setValue: React.Dispatch<React.SetStateAction<{ label: string; value: string }>>;
	onChange: (ev: number) => void;
	disabled: boolean;
	testId?: string | undefined;
};

export const MonthSelect = ({
	value,
	setValue,
	onChange,
	disabled,
	testId
}: MonthSelectProps): ReactElement => {
	const { months } = useRecurrenceItems();

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
			data-testid={testId}
		/>
	);
};
