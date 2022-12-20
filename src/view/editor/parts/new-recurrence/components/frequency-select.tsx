/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RecurrenceContext } from '../contexts';

const RepetitionFrequency = {
	DAILY: 'DAI',
	WEEKLY: 'WEE',
	MONTHLY: 'MON',
	YEARLY: 'YEA'
};

const FrequencySelect = () => {
	const { frequency, setFrequency } = useContext(RecurrenceContext);
	const [t] = useTranslation();

	const repetitionItems = useMemo(
		() => [
			{ label: t('repeat.daily', 'Daily'), value: RepetitionFrequency.DAILY },
			{ label: t('repeat.weekly', 'Weekly'), value: RepetitionFrequency.WEEKLY },
			{ label: t('repeat.monthly', 'Monthly'), value: RepetitionFrequency.MONTHLY },
			{ label: t('repeat.yearly', 'Yearly'), value: RepetitionFrequency.YEARLY }
		],
		[t]
	);

	const initialValue = useMemo(
		() => find(repetitionItems, { value: frequency }) ?? repetitionItems[0],
		[repetitionItems, frequency]
	);

	const onChange = useCallback(
		(ev) => {
			setFrequency(ev);
		},
		[setFrequency]
	);

	return (
		<Select
			label={t('label.repeat', 'Repeat')}
			onChange={onChange}
			items={repetitionItems}
			selection={initialValue}
			disablePortal
		/>
	);
};

export default FrequencySelect;
