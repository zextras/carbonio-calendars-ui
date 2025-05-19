/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { DateTimePicker } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

export default function StartDatePicker({ start, allDay, diff, onChange }) {
	const onStartChange = useCallback(
		(d) => {
			const newStartValue = d.getTime();
			const prevStartValue = start.getTime();
			if (newStartValue !== prevStartValue) {
				const startTime = newStartValue;
				const endTime = startTime + diff;
				onChange({
					start: startTime,
					end: endTime
				});
			}
		},
		[start, diff, onChange]
	);

	const label = useMemo(
		() =>
			`${
				allDay
					? t('label.start_date', 'Start date')
					: t('label.start_date_and_time', 'Start date and time')
			}`,
		[allDay]
	);
	const dateFormat = useMemo(() => (allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'), [allDay]);

	return (
		<DateTimePicker
			width="100%"
			label={label}
			defaultValue={start}
			onChange={onStartChange}
			dateFormat={dateFormat}
			includeTime={!allDay}
		/>
	);
}
