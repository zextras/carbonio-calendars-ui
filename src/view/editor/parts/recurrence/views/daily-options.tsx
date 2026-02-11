/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useState } from 'react';

import { Checkbox, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { RecurrenceContext } from 'commons/recurrence-context';
import { RECURRENCE_FREQUENCY } from 'constants/recurrence';

export const DailyOptions = (): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const [isChecked, setIsChecked] = useState(false);

	const handleCheckboxChange = useCallback(
		(value: boolean) => {
			setIsChecked(value);

			if (value) {
				setNewStartValue({
					byday: { wkday: map(['MO', 'TU', 'WE', 'TH', 'FR'], (day) => ({ day })) }
				});
			} else {
				setNewStartValue({});
			}
		},
		[setNewStartValue]
	);

	return frequency === RECURRENCE_FREQUENCY.DAILY ? (
		<>
			<Padding top={'medium'}></Padding>
			<Checkbox
				value={isChecked}
				onClick={(): void => handleCheckboxChange(!isChecked)}
				label={t('label.only_on_working_days', 'Only on working days')}
			/>
			<Padding top={'extralarge'}></Padding>
		</>
	) : null;
};
