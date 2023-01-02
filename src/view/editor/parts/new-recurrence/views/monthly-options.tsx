/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
	Checkbox,
	Container,
	Input,
	Radio,
	RadioGroup,
	Row,
	Select,
	Text,
	ModalFooter, Padding,
} from '@zextras/carbonio-design-system';
import {
	isNumber,
	isNaN,
	find,
	differenceWith,
	map,
	isEqual,
	reject,
	filter,
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
	QUICK_OPTIONS: 'QuickOptions',
	CUSTOM_OPTIONS: 'CustomOptions'
};

const defaultState = {
	freq: 'WEE',
	interval: {
		ival: 1
	},
	byday: {
		wkday: [{ day: 'MO' }]
	},
	radioValue: RADIO_VALUES.QUICK_OPTIONS
};

const radioInitialState = (freq, interval, byday, workingSchedule): string => {
	if ((freq === 'DAI' || freq === 'WEE') && byday?.wkday) {
		// building an array with the same structure of wkday to check if they have the same values
		// to determine if we are receiving the value of the working day option
		const workingDays = map(filter(workingSchedule, ['working', true]), (workingDay) => {
			const day = WEEK_SCHEDULE[workingDay.day]?.slice(0, 2);
			return { day };
		});
		const diff = differenceWith(workingDays, byday?.wkday, isEqual);
		if (diff?.length === 0 && interval?.ival === 1) {
			return RADIO_VALUES.QUICK_OPTIONS;
		}
		return RADIO_VALUES.CUSTOM_OPTIONS;
	}
	if (freq === 'WEE') {
		if (interval?.ival === 1) {
			return RADIO_VALUES.QUICK_OPTIONS;
		}
		return RADIO_VALUES.CUSTOM_OPTIONS;
	}
	return defaultState.radioValue;
};

const startValueInitialState = (freq, byday, interval, weeklyOptions) => {
	if (freq === 'WEE') {
		return omitBy({ interval, byday }, isNil);
	}
	if (freq === 'DAI' && byday?.wkday && interval?.ival === 1) {
		const option = find(
			weeklyOptions,
			(item) =>
				differenceWith(
					map(item?.value?.split?.(','), (day) => ({ day })),
					byday?.wkday ?? {},
					isEqual
				).length === 0
		);
		if (option) {
			return { interval, byday };
		}
		return { interval: defaultState.interval, byday: defaultState.byday };
	}
};

const selectInitialValue = (weeklyOptions, byday) =>
	find(
		weeklyOptions,
		(item) =>
			differenceWith(
				map(item?.value?.split?.(','), (day) => ({ day })),
				byday?.wkday ?? {},
				isEqual
			).length === 0
	) ?? weeklyOptions[0];

const setEndInitialValue = (count, until) => {
	if (count) return count;
	if (until) return until;
	return undefined;
};

const MonthlyOptions = () => {
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

	const weekOptions = useMemo(
		() => [
			{ label: t('label.week_day.monday', 'Monday'), value: 'MO' },
			{ label: t('label.week_day.tuesday', 'Tuesday'), value: 'TU' },
			{ label: t('label.week_day.wednesday', 'Wednesday'), value: 'WE' },
			{ label: t('label.week_day.thursday', 'Thursday'), value: 'TH' },
			{ label: t('label.week_day.friday', 'Friday'), value: 'FR' },
			{ label: t('label.week_day.saturday', 'Saturday'), value: 'SA' },
			{ label: t('label.week_day.sunday', 'Sunday'), value: 'SU' }
		],
		[]
	);

	const weeklyOptions = useMemo(
		() => [
			{ label: t('label.every_day', 'Every day'), value: 'MO,TU,WE,TH,FR,SA,SU' },
			{ label: t('items.weekend_day', 'Weekend day'), value: 'SA,SU' },
			{ label: t('items.working_day', 'Working day'), value: 'MO,TU,WE,TH,FR' },
			...weekOptions
		],
		[weekOptions]
	);

	const [radioValue, setRadioValue] = useState(() =>
		radioInitialState(freq, interval, byday, workingSchedule)
	);
	const [inputValue, setInputValue] = useState<number | ''>(interval?.ival ?? 1);
	const [selectValue, setSelectValue] = useState(() => selectInitialValue(weeklyOptions, byday));
	const [checkboxesValue, setCheckboxesValue] = useState(byday?.wkday ?? []);
	const [end, setEnd] = useState(() => setEndInitialValue(count, until));
	const [startValue, setStartValue] = useState(() =>
		startValueInitialState(freq, byday, interval, workingSchedule)
	);
	const onByDayChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.QUICK_OPTIONS) {
				const days = map(ev?.split?.(','), (day) => ({ day }));
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(weeklyOptions, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? weeklyOptions[0];
				setSelectValue(newValue);
				setStartValue({ byday: { wkday: days } });
			}
		},
		[radioValue, weeklyOptions]
	);

	const onChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.QUICK_OPTIONS:
					setStartValue({
						byday: { wkday: map(selectValue?.value?.split?.(','), (day) => ({ day })) }
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.CUSTOM_OPTIONS:
					setStartValue({
						byday: { wkday: checkboxesValue },
						interval: { ival: inputValue }
					});
					setRadioValue(ev);
					break;
				default:
					setStartValue({
						byday: { wkday: map(selectValue?.value?.split?.(','), (day) => ({ day })) }
					});
					setRadioValue(RADIO_VALUES.QUICK_OPTIONS);
					break;
			}
		},
		[checkboxesValue, inputValue, selectValue?.value, setStartValue]
	);

	const onInputChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setStartValue((prevValue) => ({
					...prevValue,
					interval: {
						ival: 1
					}
				}));
				setInputValue(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber > 0
				) {
					setInputValue(convertedInputToNumber);
					if (radioValue === RADIO_VALUES.CUSTOM_OPTIONS) {
						setStartValue((prevValue) => ({
							...prevValue,
							interval: {
								ival: convertedInputToNumber
							}
						}));
					}
				}
			}
		},
		[setStartValue, radioValue]
	);

	const ordinalNumbers = useMemo(
		() => [
			{ label: t('items.first', 'First'), value: '1' },
			{ label: t('items.second', 'Second'), value: '2' },
			{ label: t('items.third', 'Third'), value: '3' },
			{ label: t('items.fourth', 'Fourth'), value: '4' },
			{ label: t('items.last', 'Last'), value: '-1' }
		],
		[]
	);

	const onConfirm = useCallback(() => {
		console.log('@@@ weekly footer');
		console.log('@@@ ', frequency, startValue, end);
	}, [frequency, startValue, end]);

	return frequency === 'MON' ? (
		<>
			<RadioGroup value={radioValue} onChange={onChange}>
				<Radio
					label={
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Padding horizontal="small">
								<Text overflow="break-word">{t('label.day', 'Day')}</Text>
							</Padding>
							<Input
								label={t('label.day', 'Day')}
								onClick={() => null}
								width="fit"
								backgroundColor="gray5"
								value={1}
							/>
							<Padding horizontal="small">
								<Text>{t('label.of_every', 'of every')}</Text>
							</Padding>
							<Input
								label={t('label.month', 'Month')}
								onClick={() => null}
								backgroundColor="gray5"
								value={1}
							/>
						</Row>
					}
					value={RADIO_VALUES.QUICK_OPTIONS}
				/>
				<Radio
					label={
						<Container
							orientation="vertical"
							mainAlignment="center"
							crossAlignment="flex-start"
							width="100%"
						>
							<Container
								orientation="horizontal"
								mainAlignment="flex-start"
								crossAlignment="center"
								width="fill"
							>
								<Padding horizontal="small">
									<Text>{t('label.the', 'The')}</Text>
								</Padding>
								<Select
									items={ordinalNumbers}
									label={t('label.number', 'Number')}
									onChange={() => null}
									disablePortal
									width="fit"
									selection={ordinalNumbers[0]}
								/>
								<Padding horizontal="small" />
								<Select
									items={weekOptions}
									label={t('label.day', 'Day')}
									onChange={onByDayChange}
									disablePortal
									width="fit"
									defaultSelection={weekOptions[0]}
								/>
							</Container>
							<Container
								orientation="horizontal"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ vertical: 'small' }}
								width="80%"
							>
								<Padding horizontal="small">
									<Text>{t('label.of_every_month', 'of the month, every')}</Text>
								</Padding>
								<Input
									label={t('label.month', 'Month')}
									onClick={() => null}
									backgroundColor="gray5"
									value={1}
								/>
								<Padding horizontal="small">
									<Text>{t('label.months', 'Months')}</Text>
								</Padding>
							</Container>
						</Container>
					}
					value={RADIO_VALUES.CUSTOM_OPTIONS}
				/>
			</RadioGroup>
			<RecurrenceEndOptions end={end} setEnd={setEnd} />
			<ModalFooter onConfirm={onConfirm} confirmLabel={t('repeat.customize', 'Customize')} />
		</>
	) : null;
};

export default MonthlyOptions;
