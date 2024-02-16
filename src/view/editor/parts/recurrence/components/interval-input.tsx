/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { isNaN, isNumber } from 'lodash';

type IntervalInputProps = {
	label: string;
	value: number | '';
	setValue: React.Dispatch<React.SetStateAction<number | ''>>;
	onChange: (ev: number) => void;
	disabled: boolean;
};

export const IntervalInput = ({
	label,
	value,
	setValue,
	onChange,
	disabled
}: IntervalInputProps): ReactElement => {
	const onIntervalChange = useCallback(
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
			label={label}
			onChange={onIntervalChange}
			backgroundColor="gray5"
			disabled={disabled}
			value={value}
			hasError={(isNumber(value) && !isNaN(value) && (value < 1 || value > 99)) || !isNumber(value)}
		/>
	);
};
