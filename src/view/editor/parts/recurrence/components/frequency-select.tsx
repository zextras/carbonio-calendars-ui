/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Padding, Select, SingleSelectionOnChange, Text } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { IntervalInput } from './interval-input';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { useAppSelector } from 'store/redux/hooks';
import { selectEditorRecurrenceInterval } from 'store/selectors/editor';

const FrequencySelect = ({ editorId }: { editorId: string }): ReactElement => {
	const { frequency, setFrequency, setNewStartValue } = useContext(RecurrenceContext);
	const [t] = useTranslation();

	const { repetitionItems } = useRecurrenceItems();

	const initialValue = useMemo(
		() => find(repetitionItems, { value: frequency }) ?? repetitionItems[0],
		[repetitionItems, frequency]
	);

	useEffect(() => {
		if (initialValue) {
			const value = find(repetitionItems, { value: frequency }) ?? repetitionItems[0];
			setFrequency(value?.value);
		}
	}, [frequency, initialValue, repetitionItems, setFrequency]);

	const onChange = useCallback<SingleSelectionOnChange>(
		(ev) => {
			ev && setFrequency?.(ev);
		},
		[setFrequency]
	);

	const defaultState = {
		freq: RECURRENCE_FREQUENCY.DAILY,
		interval: {
			ival: 1
		},
		radioValue: RADIO_VALUES.EVERYDAY
	};

	const interval = useAppSelector(selectEditorRecurrenceInterval(editorId));

	const [inputValue, setInputValue] = useState<string>(
		`${interval?.ival ?? defaultState?.interval?.ival}`
	);

	const onInputChange = useCallback(
		(ev: number) => {
			setNewStartValue?.({
				interval: {
					ival: ev
				}
			});
		},
		[setNewStartValue]
	);

	return (
		<>
			<Text overflow="break-word">{t('label.every', 'Every')}</Text>
			<Padding horizontal="small">
				<IntervalInput
					disabled={false}
					value={inputValue}
					onChange={onInputChange}
					label={t('label.days', 'Days')}
					setValue={setInputValue}
				/>
			</Padding>
			<Select
				label={t('label.repeat', 'Repeat')}
				onChange={onChange}
				items={repetitionItems}
				selection={initialValue}
				disablePortal
			/>
		</>
	);
};

export default FrequencySelect;
