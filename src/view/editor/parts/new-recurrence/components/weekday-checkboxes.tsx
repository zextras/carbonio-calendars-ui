/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox, Container } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { find, map, reject } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';

export const WeekdayCheckboxes = ({
	value,
	setValue,
	disabled,
	onClick,
	isHidden
}): ReactElement | null => {
	const selectItems = useMemo(
		() => [
			{ label: t('label.week_day.monday', 'Monday'), value: 'MO' },
			{ label: t('label.week_day.tuesday', 'Tuesday'), value: 'TU' },
			{ label: t('label.week_day.wednesday', 'Wednesday'), value: 'WE' },
			{ label: t('label.week_day.thursday', 'Thursday'), value: 'TH' },
			{ label: t('label.week_day.friday', 'Friday'), value: 'FR' },
			{ label: t('label.week_day.saturday', 'Saturday'), value: 'SA' },
			{ label: t('label.week_day.sunday', 'Sunday'), value: 'SU' }
		],
		[]
	);

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
			{map(selectItems, (opt) => {
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
