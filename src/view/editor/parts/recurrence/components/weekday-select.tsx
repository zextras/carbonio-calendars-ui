/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Select, SelectItem } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { differenceWith, find, isEqual, map } from 'lodash';

import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';

type WeekDaySelectorProps = {
	selection?: SelectItem;
	setSelection: React.Dispatch<React.SetStateAction<{ label: string; value: string }>>;
	onChange: (ev: { day: string }[]) => void;
	disabled?: boolean;
};

const WeekdaySelect = ({
	selection,
	setSelection,
	onChange,
	disabled = false
}: WeekDaySelectorProps): ReactElement | null => {
	const { weekOptions } = useRecurrenceItems();

	const daySelection = useMemo(
		() =>
			find(
				weekOptions,
				(item) =>
					differenceWith(
						map(item.value.split(','), (day) => ({ day })),
						map((selection?.value ?? weekOptions?.[0]?.value)?.split(','), (day) => ({
							day
						})),
						isEqual
					).length === 0
			),
		[weekOptions, selection]
	);

	const onByDayChange = useCallback(
		(ev) => {
			if (ev) {
				const days = map(ev.split(','), (day) => ({ day }));
				const selectedValue = ev?.split?.(',');

				const newValue =
					find(weekOptions, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? weekOptions[0];
				setSelection(newValue);
				onChange(days);
			}
		},
		[onChange, setSelection, weekOptions]
	);
	return daySelection ? (
		<Select
			items={weekOptions}
			label={t('label.day', 'Day')}
			onChange={onByDayChange}
			disablePortal
			width="fit"
			disabled={disabled}
			selection={daySelection}
		/>
	) : null;
};

export default WeekdaySelect;
