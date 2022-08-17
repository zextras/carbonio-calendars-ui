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

export default function EndDatePicker({ start, end, allDay, diff, onChange }) {
	const [t] = useTranslation();
	const onEndChange = useCallback(
		(d) =>
			onChange({
				end: d.getTime(),
				start: d.getTime() > start ? start : d.getTime() - diff
			}),
		[onChange, start, diff]
	);
	const endDate = useMemo(() => new Date(end), [end]);
	const dateFormat = useMemo(() => (allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'), [allDay]);
	const label = useMemo(
		() =>
			`${
				allDay ? t('label.end_date', 'End date') : t('label.end_date_and_time', 'End date and time')
			}`,
		[t, allDay]
	);
	return (
		<DateTimePicker
			width="100%"
			dateFormat={dateFormat}
			label={label}
			includeTime={!allDay}
			defaultValue={endDate}
			onChange={onEndChange}
			customInput={
				<DatePickerCustomComponent label={label} value={endDate} onChange={onEndChange} />
			}
		/>
	);
}
