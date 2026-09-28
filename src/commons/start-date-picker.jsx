/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { DateTimePicker } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { getDateFnsLocale } from './date-fns-react-widgets-localizer';
import { getDateTimeToken, getPickerTimeFormatToken, useIs24HourFormat } from './time-format';

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
	const is24h = useIs24HourFormat();
	const dateFormat = useMemo(() => (allDay ? 'P' : getDateTimeToken(is24h)), [allDay, is24h]);

	return (
		<DateTimePicker
			width="100%"
			label={label}
			defaultValue={start}
			onChange={onStartChange}
			dateFormat={dateFormat}
			timeFormat={allDay ? undefined : getPickerTimeFormatToken(is24h)}
			locale={getDateFnsLocale()}
			includeTime={!allDay}
		/>
	);
}
