/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNaN, isNumber } from 'lodash';

type IntervalInputProps = {
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	onChange: (ev: number) => void;
	disabled: boolean;
	testId?: string | undefined;
};

export const MonthlyDayInput = ({
	disabled,
	setValue,
	onChange,
	value,
	testId
}: IntervalInputProps): ReactElement => {
	const onMonthChange = useCallback(
		(ev: React.ChangeEvent<HTMLInputElement>) => {
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
					setValue(ev.target.value);
					onChange(convertedInputToNumber);
				}
			}
		},
		[onChange, setValue]
	);
	const hasError = useMemo(() => {
		const convertedValue = parseInt(value, 10);
		if (!isNumber(convertedValue) || isNaN(convertedValue)) {
			return true;
		}
		return convertedValue < 1 || convertedValue > 31;
	}, [value]);

	return (
		<Input
			backgroundColor="gray5"
			label={t('label.day', 'Day')}
			value={value}
			onChange={onMonthChange}
			disabled={disabled}
			hasError={hasError}
			data-testid={testId}
		/>
	);
};
