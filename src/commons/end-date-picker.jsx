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

export default function EndDatePicker({ start, end, allDay, diff, onChange }) {
	const onEndChange = useCallback(
		(d) => {
			const newEndValue = d.getTime();
			const prevEndValue = end.getTime();
			const prevStartValue = start.getTime();
			if (newEndValue !== prevEndValue) {
				onChange({
					end: newEndValue,
					start: newEndValue > prevStartValue ? prevStartValue : newEndValue - diff
				});
			}
		},
		[end, onChange, start, diff]
	);
	const is24h = useIs24HourFormat();
	const dateFormat = useMemo(() => (allDay ? 'P' : getDateTimeToken(is24h)), [allDay, is24h]);
	const label = useMemo(
		() =>
			`${
				allDay ? t('label.end_date', 'End date') : t('label.end_date_and_time', 'End date and time')
			}`,
		[allDay]
	);
	return (
		<DateTimePicker
			width="100%"
			label={label}
			defaultValue={end}
			onChange={onEndChange}
			dateFormat={dateFormat}
			timeFormat={allDay ? undefined : getPickerTimeFormatToken(is24h)}
			locale={getDateFnsLocale()}
			includeTime={!allDay}
		/>
	);
}
