/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement } from 'react';

import { Container, DateTimePicker } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

type ComponentProps = {
	fromDate: Date | null;
	setFromDate: (arg: Date | null) => void;
	toDate: Date | null;
	setToDate: (arg: Date | null) => void;
};
const FromDateToDateRow: FC<ComponentProps> = ({
	fromDate,
	setFromDate,
	toDate,
	setToDate
}): ReactElement => {
	const onFromDateChange = (date: Date | null): void => {
		setFromDate(date);
	};

	const onToDateChange = (date: Date | null): void => {
		setToDate(date);
	};

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Container padding={{ right: 'extrasmall' }}>
				<DateTimePicker
					width="fill"
					label={t('search.from_date', 'From Date')}
					enableChips
					chipProps={{ avatarBackground: 'gray1', avatarIcon: 'CalendarOutline' }}
					dateFormat="dd/MM/yyyy"
					showTimeSelect={false}
					defaultValue={fromDate}
					onChange={onFromDateChange}
				/>
			</Container>
			<Container padding={{ horizontal: 'extrasmall' }}>
				<DateTimePicker
					width="fill"
					label={t('search.to_date', 'To Date')}
					enableChips
					chipProps={{ avatarBackground: 'gray1', avatarIcon: 'CalendarOutline' }}
					dateFormat="dd/MM/yyyy"
					showTimeSelect={false}
					defaultValue={toDate}
					onChange={onToDateChange}
				/>
			</Container>
		</Container>
	);
};

export default FromDateToDateRow;
