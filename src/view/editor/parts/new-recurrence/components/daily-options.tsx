/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Input, Radio, RadioGroup, Row, Text, ModalFooter } from '@zextras/carbonio-design-system';
import {
	isNumber,
	isNaN,
	reduce,
	filter,
	map,
	differenceWith,
	isEqual,
	omitBy,
	isNil
} from 'lodash';
import { useSelector } from 'react-redux';
import { usePrefs } from '../../../../../carbonio-ui-commons/utils/use-prefs';
import { WEEK_SCHEDULE } from '../../../../../constants/calendar';
import {
	selectEditorRecurrenceByDay, selectEditorRecurrenceCount,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval, selectEditorRecurrenceUntilDate,
} from '../../../../../store/selectors/editor';
import { workWeek } from '../../../../../utils/work-week';
import { RecurrenceContext } from '../contexts';
import RecurrenceEndOptions from './recurrence-end-options';

const RADIO_VALUES = {
	EVERYDAY: 'Everyday',
	WORKING_DAY: 'Working_day',
	EVERY_X_DAY: 'Every_x_days'
};

const defaultState = {
	freq: 'DAI',
	interval: {
		ival: 1
	},
	radioValue: RADIO_VALUES.EVERYDAY
};

const initialState = (freq, interval, byday, workingSchedule): string => {
	if ((freq === 'DAI' || freq === 'WEE') && byday?.wkday && interval?.ival === 1) {
		// building an array with the same structure of wkday to check if they have the same values
		// to determine if we are receiving a workingday value
		const workingDays = map(filter(workingSchedule, ['working', true]), (workingDay) => {
			const day = WEEK_SCHEDULE[workingDay.day]?.slice(0, 2);
			return { day };
		});
		const diff = differenceWith(workingDays, byday?.wkday, isEqual);
		if (diff?.length === 0) {
			return RADIO_VALUES.WORKING_DAY;
		}
		return defaultState.radioValue;
	}
	if (freq === 'DAI' && interval?.ival === 1 && !byday?.wkday) {
		return RADIO_VALUES.EVERYDAY;
	}
	if (freq === 'DAI' && interval?.ival > 1 && !byday?.wkday) {
		return RADIO_VALUES.EVERY_X_DAY;
	}
	return defaultState.radioValue;
};

const startValueInitialState = (freq, byday, interval, workingSchedule) => {
	if (freq === 'DAI') {
		return omitBy({ interval, byday }, isNil);
	}
	if (freq === 'WEE' && byday?.wkday && interval?.ival === 1) {
		const workingDays = map(filter(workingSchedule, ['working', true]), (workingDay) => {
			const day = WEEK_SCHEDULE[workingDay.day]?.slice(0, 2);
			return { day };
		});
		const diff = differenceWith(workingDays, byday?.wkday, isEqual);
		if (diff?.length === 0 && interval?.ival === 1) {
			return { interval, byday };
		}
		return { interval: defaultState.interval };
	}
};

const setEndInitialValue = (count, until) => {
	if (count) return count;
	if (until) return until;
	return undefined;
};

const DailyOptions = () => {
	const { editorId, frequency } = useContext(RecurrenceContext);
	const freq = useSelector(selectEditorRecurrenceFrequency(editorId));
	const interval = useSelector(selectEditorRecurrenceInterval(editorId));
	const byday = useSelector(selectEditorRecurrenceByDay(editorId));
	const count = useSelector(selectEditorRecurrenceCount(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));

	const prefs = usePrefs();

	const workingSchedule = useMemo(
		() => workWeek(prefs.zimbraPrefCalendarWorkingHours),
		[prefs?.zimbraPrefCalendarWorkingHours]
	);
	const [radioValue, setRadioValue] = useState(() =>
		initialState(freq, interval, byday, workingSchedule)
	);
	const [end, setEnd] = useState(() => setEndInitialValue(count, until));

	const [startValue, setStartValue] = useState(() =>
		startValueInitialState(freq, byday, interval, workingSchedule)
	);

	const [inputValue, setInputValue] = useState<number | ''>(
		interval?.ival ?? defaultState?.interval?.ival
	);

	const setStartByWorkingDay = useCallback(() => {
		const wkday = reduce(
			workingSchedule,
			(result, weekday) => {
				if (weekday.working) {
					const day = WEEK_SCHEDULE[weekday.day];
					return [
						...result,
						{
							day: day.slice(0, 2)
						}
					];
				}
				return result;
			},
			[]
		);
		setStartValue({
			byday: { wkday }
		});
	}, [setStartValue, workingSchedule]);

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
					setStartByWorkingDay();
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
		[inputValue, setStartValue, setStartByWorkingDay]
	);

	const onInputChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setStartValue({
					interval: {
						ival: 1
					}
				});
				setInputValue(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber > 0
				) {
					setInputValue(convertedInputToNumber);
					if (radioValue === RADIO_VALUES.EVERY_X_DAY) {
						setStartValue({
							interval: {
								ival: convertedInputToNumber
							}
						});
					}
				}
			}
		},
		[setStartValue, radioValue]
	);
	const onConfirm = useCallback(() => {
		console.log('@@@ daily footer');
		console.log('@@@ ', frequency, startValue, end);
	}, [end, frequency, startValue]);

	return frequency === 'DAI' ? (
		<>
			<RadioGroup value={radioValue} onChange={onChange}>
				<Radio label={t('label.every_day', 'Every day')} value={RADIO_VALUES.EVERYDAY} />
				<Radio
					label={t('items.working_day', 'Every working day')}
					value={RADIO_VALUES.WORKING_DAY}
				/>
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
					value={RADIO_VALUES.EVERY_X_DAY}
				/>
			</RadioGroup>
			<RecurrenceEndOptions end={end} setEnd={setEnd} />
			<ModalFooter onConfirm={onConfirm} confirmLabel={t('repeat.customize', 'Customize')} />
		</>
	) : null;
};

export default DailyOptions;
