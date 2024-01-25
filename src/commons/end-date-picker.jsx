/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { DateTimePicker } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

export default function EndDatePicker({ start, end, allDay, diff, onChange }) {
	const onEndChange = useCallback(
		(d) =>
			onChange({
				end: moment(d).valueOf(),
				start: moment(d).valueOf() > start ? start : moment(d).valueOf() - diff
			}),
		[onChange, start, diff]
	);
	const dateFormat = useMemo(() => (allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'), [allDay]);
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
			includeTime={!allDay}
		/>
	);
}
