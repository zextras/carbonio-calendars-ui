/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import momentLocalizer from 'react-widgets-moment';

import Styler from './date-picker-style';
// import EndDatePicker from './end-date-picker';
import StartTimePicker from './start-time-picker';

momentLocalizer();

export default function DatePicker({ start, end, onChange, day, disabled }) {
	return (
		<>
			<Styler orientation="horizontal" allDay height="fit" mainAlignment="space-between">
				<Container padding={{ all: 'small' }}>
					<StartTimePicker
						disabled={disabled}
						start={start}
						showEnd={false}
						onChange={onChange}
						day={day}
						label={t('label.from', 'from')}
					/>
				</Container>
				<Container padding={{ all: 'small' }}>
					<StartTimePicker
						label={t('label.to', 'to')}
						disabled={disabled}
						start={end}
						showEnd
						onChange={onChange}
						day={day}
					/>
				</Container>
			</Styler>
		</>
	);
}
