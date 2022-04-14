/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useLayoutEffect, useMemo } from 'react';
import { Checkbox, Container } from '@zextras/carbonio-design-system';
import momentLocalizer from 'react-widgets-moment';
import { useTranslation } from 'react-i18next';

momentLocalizer();

export default function AllDayCheckbox({ start, end, allDay, onChange, onAllDayChange }) {
	const [t] = useTranslation();

	const startDate = useMemo(() => new Date(start), [start]);
	const endDate = useMemo(() => new Date(end), [end]);

	useLayoutEffect(() => {
		if (allDay) {
			onChange({
				start: startDate.setHours(0, 0, 0, 0),
				end: endDate.setHours(0, 0, 0, 0)
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allDay]);
	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<Checkbox
				label={t('label.all_day', 'All day')}
				onChange={onAllDayChange}
				defaultChecked={allDay}
			/>
		</Container>
	);
}
