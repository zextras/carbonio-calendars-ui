/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Button, Row } from '@zextras/carbonio-design-system';
import { find, map, reject } from 'lodash';

import { useRecurrenceItems } from 'commons/use-recurrence-items';

type WeekdayCheckboxesProps = {
	value: { day: string }[];
	setValue: React.Dispatch<React.SetStateAction<{ day: string }[]>>;
	disabled: boolean;
	onClick: (newValue: { day: string }[]) => void;
	isHidden: boolean;
};

export const WeekdayCheckboxes = ({
	value,
	setValue,
	disabled,
	onClick,
	isHidden
}: WeekdayCheckboxesProps): ReactElement | null => {
	const { weekDays } = useRecurrenceItems();

	const onCheckboxClick = useCallback(
		(opt: { value: string }) => {
			const checkbox = find(value, { day: opt.value });
			if (!checkbox) {
				const newValue = [...value, { day: opt.value }];
				setValue(newValue);
				onClick(newValue);
			} else if (value.length > 1) {
				const newValue = reject(value, { day: opt.value });
				setValue(newValue);
				onClick(newValue);
			}
		},
		[value, onClick, setValue]
	);

	return isHidden ? null : (
		<Row width="fill" mainAlignment="space-between" wrap="nowrap" gap={'0.5rem'}>
			{map(weekDays, (opt) => {
				const isChecked = !!find(value, ({ day }) => day === opt.value);
				return (
					<Button
						key={`week_day_${opt.value}`}
						type={isChecked ? 'default' : 'outlined'}
						label={opt.label.slice(0, 3).toUpperCase()}
						onClick={(): void => onCheckboxClick(opt)}
						disabled={disabled}
						labelColor={isChecked ? 'white' : 'primary'}
						size="medium"
						width="fill"
					/>
				);
			})}
		</Row>
	);
};
