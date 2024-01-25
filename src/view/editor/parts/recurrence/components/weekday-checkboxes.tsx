/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Checkbox, Container } from '@zextras/carbonio-design-system';
import { find, map, reject } from 'lodash';

import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';

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
		(opt) => {
			const checkbox = find(value, { day: opt.value });
			if (!checkbox) {
				const newValue = [...value, { day: opt.value }];
				setValue(newValue);
				onClick(newValue);
			} else {
				const newValue = reject(value, { day: opt.value });
				setValue(newValue);
				onClick(newValue);
			}
		},
		[value, onClick, setValue]
	);

	return isHidden ? null : (
		<>
			{map(weekDays, (opt) => {
				const isChecked = !!find(value, ({ day }) => day === opt.value);
				return (
					<Container
						key={`week_day_${opt.value}`}
						orientation="horizontal"
						width="fit"
						mainAlignment="flex-start"
						padding={{ horizontal: 'small' }}
					>
						<Checkbox
							size="small"
							key={opt.label}
							onClick={(): void => onCheckboxClick(opt)}
							label={opt.label.slice(0, 3)}
							value={isChecked}
							disabled={disabled}
						/>
					</Container>
				);
			})}
		</>
	);
};
