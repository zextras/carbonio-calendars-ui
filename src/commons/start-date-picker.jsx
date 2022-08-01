/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import { DateTimePicker } from '@zextras/carbonio-design-system';
import momentLocalizer from 'react-widgets-moment';
import { useTranslation } from 'react-i18next';
import DatePickerCustomComponent from './date-picker-custom-component';

momentLocalizer();

export default function StartDatePicker({ start, end, allDay, diff, onChange }) {
	const [t] = useTranslation();
	const onStartChange = useCallback(
		(d) =>
			onChange({
				start: d.getTime(),
				end: d.getTime() + diff
			}),
		[onChange, diff]
	);

	const startDate = useMemo(() => new Date(start), [start]);
	const label = useMemo(
		() =>
			`${
				allDay
					? t('label.start_date', 'Start date')
					: t('label.start_date_and_time', 'Start date and time')
			}`,
		[allDay, t]
	);
	const dateFormat = useMemo(() => (allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'), [allDay]);
	return (
		<DateTimePicker
			width="100%"
			style={{ zIndex: 10 }}
			dateFormat={dateFormat}
			label={label}
			includeTime={!allDay}
			defaultValue={startDate}
			onChange={onStartChange}
			customInput={
				<DatePickerCustomComponent label={label} value={startDate} onChange={onStartChange} />
			}
		/>
	);
}
