/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { DateTimePicker } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

export default function StartDatePicker({ start, allDay, diff, onChange }) {
	const onStartChange = useCallback(
		(d) => {
			const startTime = moment(d).valueOf();
			const endTime = startTime + diff;
			return onChange({
				start: startTime,
				end: endTime
			});
		},
		[onChange, diff]
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
