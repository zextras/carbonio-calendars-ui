/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useContext, useState } from 'react';
import { Input, Radio, RadioGroup, Row, Text } from '@zextras/carbonio-design-system';
import { isNumber, isNaN } from 'lodash';
import { RecurrenceContext } from '../contexts';

const DailyOptions = () => {
	const { ival, setIval, byWeekDay } = useContext(RecurrenceContext);
	const initialState = (): string => {
		if (ival && ival === 1 && !byWeekDay) {
			return 'everyday';
		}
		if (byWeekDay) {
			return 'every-working-day';
		}
		if (ival && ival > 0 && !byWeekDay) {
			return 'every-x-days';
		}
		return 'everyday';
	};
	const [radioValue, setRadioValue] = useState(initialState);
	const [inputValue, setInputValue] = useState<number | ''>(ival ?? 2);

	const onChange = useCallback(
		(ev) => {
			switch (ev) {
				case 'everyday':
					setIval(1);
					setRadioValue(ev);
					break;
				case 'every-working-day':
					setIval(1);
					setRadioValue(ev);
					break;
				case 'every-x-days':
					isNumber(inputValue) && !isNaN(inputValue) && inputValue > 0 && setIval(inputValue);
					setRadioValue(ev);
					break;
				default:
					setIval(1);
					setRadioValue('everyday');
					break;
			}
		},
		[inputValue, setIval]
	);

	const onInputChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setIval(1);
				setInputValue(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber > 0
				) {
					setInputValue(convertedInputToNumber);
					if (radioValue === 'every-x-days') {
						setIval(convertedInputToNumber);
					}
				}
			}
		},
		[setIval, radioValue]
	);

	return (
		<RadioGroup value={radioValue} onChange={onChange}>
			<Radio label={t('label.every_day', 'Every day')} value="everyday" />
			<Radio label={t('items.working_day', 'Every working day')} value="every-working-day" />
			<Radio
				label={
					<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Text overflow="break-word">{t('label.every', 'Every')}</Text>
						<Input
							backgroundColor="gray5"
							label={t('label.days', 'Days')}
							value={inputValue}
							onChange={onInputChange}
						/>
						<Text overflow="break-word">{t('label.days', 'Days')}</Text>
					</Row>
				}
				value="every-x-days"
			/>
		</RadioGroup>
	);
};

export default DailyOptions;
