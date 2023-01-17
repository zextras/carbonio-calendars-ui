/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Input } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNaN, isNumber } from 'lodash';
import React, { ReactElement, useCallback } from 'react';

type IntervalInputProps = {
	value: number | '';
	setValue: React.Dispatch<React.SetStateAction<number | ''>>;
	onChange: (ev: number) => void;
	disabled: boolean;
};

export const MonthlyDayInput = ({
	disabled,
	setValue,
	onChange,
	value
}: IntervalInputProps): ReactElement => {
	const onMonthChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				onChange(1);
				setValue(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber >= 0
				) {
					setValue(convertedInputToNumber);
					onChange(convertedInputToNumber);
				}
			}
		},
		[onChange, setValue]
	);
	return (
		<Input
			backgroundColor="gray5"
			label={t('label.day', 'Day')}
			value={value}
			onChange={onMonthChange}
			disabled={disabled}
			hasError={(isNumber(value) && !isNaN(value) && (value < 1 || value > 31)) || !isNumber(value)}
		/>
	);
};