/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';

import { Radio, RadioGroup, Row, Text, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNumber, isNaN, map, differenceWith, isEqual, omitBy, isNil } from 'lodash';

import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from '../../../../../constants/recurrence';
import { useAppSelector } from '../../../../../store/redux/hooks';
import {
	selectEditorRecurrenceByDay,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval
} from '../../../../../store/selectors/editor';
import { Byday, Interval, RecurrenceStartValue } from '../../../../../types/editor';
import { IntervalInput } from '../components/interval-input';

const defaultState = {
	freq: RECURRENCE_FREQUENCY.DAILY,
	interval: {
		ival: 1
	},
	radioValue: RADIO_VALUES.EVERYDAY
};

const initialState = (
	freq: string | undefined,
	interval: Interval | undefined,
	byday: Byday | undefined
): string => {
	if (
		(freq === RECURRENCE_FREQUENCY.DAILY || freq === RECURRENCE_FREQUENCY.WEEKLY) &&
		byday?.wkday &&
		interval?.ival === 1
	) {
		// building an array with the same structure of wkday to check if they have the same values
		// to determine if we are receiving a workingday value
		const workingDays = map(['MO', 'TU', 'WE', 'TH', 'FR'], (day) => ({ day }));
		const diff = differenceWith(workingDays, byday?.wkday, isEqual);
		if (diff?.length === 0) {
			return RADIO_VALUES.WORKING_DAY;
		}
		return defaultState.radioValue;
	}
	if (freq === RECURRENCE_FREQUENCY.DAILY && interval?.ival === 1 && !byday?.wkday) {
		return RADIO_VALUES.EVERYDAY;
	}
	if (freq === RECURRENCE_FREQUENCY.DAILY && interval && interval?.ival > 1 && !byday?.wkday) {
		return RADIO_VALUES.EVERY_X_DAY;
	}
	return defaultState.radioValue;
};

const startValueInitialState = (
	freq: string | undefined,
	byday: Byday | undefined,
	interval: Interval | undefined
): RecurrenceStartValue | undefined => {
	if (freq === RECURRENCE_FREQUENCY.DAILY) {
		return omitBy({ interval, byday }, isNil);
	}
	if (freq === RECURRENCE_FREQUENCY.WEEKLY && byday?.wkday && interval?.ival === 1) {
		const workingDays = map(['MO', 'TU', 'WE', 'TH', 'FR'], (day) => ({ day }));
		const diff = differenceWith(workingDays, byday?.wkday, isEqual);
		if (diff?.length === 0 && interval?.ival === 1) {
			return { interval, byday };
		}
		return { interval: defaultState.interval };
	}
	return undefined;
};

const DailyOptions = ({ editorId }: { editorId: string }): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const freq = useAppSelector(selectEditorRecurrenceFrequency(editorId));
	const interval = useAppSelector(selectEditorRecurrenceInterval(editorId));
	const byday = useAppSelector(selectEditorRecurrenceByDay(editorId));

	const [radioValue, setRadioValue] = useState(() => initialState(freq, interval, byday));

	const [startValue, setStartValue] = useState(() => startValueInitialState(freq, byday, interval));

	const [inputValue, setInputValue] = useState<number | ''>(
		interval?.ival ?? defaultState?.interval?.ival
	);

	const onChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.EVERYDAY:
					setStartValue({
						interval: {
							ival: 1
						}
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.WORKING_DAY:
					setStartValue({
						byday: { wkday: map(['MO', 'TU', 'WE', 'TH', 'FR'], (day) => ({ day })) }
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.EVERY_X_DAY:
					isNumber(inputValue) &&
						!isNaN(inputValue) &&
						inputValue > 0 &&
						setStartValue({
							interval: {
								ival: inputValue
							}
						});
					setRadioValue(ev);
					break;
				default:
					setStartValue({
						interval: {
							ival: 1
						}
					});
					setRadioValue(RADIO_VALUES.EVERYDAY);
					break;
			}
		},
		[inputValue, setStartValue]
	);

	const onInputChange = useCallback(
		(ev) => {
			if (radioValue === RADIO_VALUES.EVERY_X_DAY) {
				setStartValue({
					interval: {
						ival: ev
					}
				});
			}
		},
		[setStartValue, radioValue]
	);

	useEffect(() => {
		if (startValue && frequency === RECURRENCE_FREQUENCY.DAILY) {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === RECURRENCE_FREQUENCY.DAILY ? (
		<RadioGroup value={radioValue} onChange={onChange}>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Padding vertical="small">
						<Text overflow="break-word">{t('label.every_day', 'Every day')}</Text>
					</Padding>
				}
				value={RADIO_VALUES.EVERYDAY}
			/>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Padding vertical="small">
						<Text overflow="break-word">{t('items.working_day', 'Every working day')}</Text>
					</Padding>
				}
				value={RADIO_VALUES.WORKING_DAY}
			/>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Padding top="small">
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Text overflow="break-word">{t('label.every', 'Every')}</Text>
							<Padding horizontal="small">
								<IntervalInput
									disabled={radioValue !== RADIO_VALUES.EVERY_X_DAY}
									value={inputValue}
									onChange={onInputChange}
									label={t('label.days', 'Days')}
									setValue={setInputValue}
								/>
							</Padding>
							<Text overflow="break-word">{t('label.days', 'Days')}</Text>
						</Row>
					</Padding>
				}
				value={RADIO_VALUES.EVERY_X_DAY}
			/>
		</RadioGroup>
	) : null;
};

export default DailyOptions;
