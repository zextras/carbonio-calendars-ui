/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Radio, RadioGroup, Row, Text, Padding } from '@zextras/carbonio-design-system';
import { find, differenceWith, map, isEqual, filter, omitBy, isNil } from 'lodash';
import { useSelector } from 'react-redux';
import { usePrefs } from '../../../../../carbonio-ui-commons/utils/use-prefs';
import { WEEK_SCHEDULE } from '../../../../../constants/calendar';
import {
	selectEditorRecurrenceByDay,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval
} from '../../../../../store/selectors/editor';
import { workWeek } from '../../../../../utils/work-week';
import { IntervalInput } from '../components/interval-input';
import { WeekdayCheckboxes } from '../components/weekday-checkboxes';
import WeekdaySelect from '../components/weekday-select';
import { RecurrenceContext } from '../contexts';

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

const WeeklyOptions = () => {
	const { editorId, frequency, setNewStartValue } = useContext(RecurrenceContext);
	const freq = useSelector(selectEditorRecurrenceFrequency(editorId));
	const interval = useSelector(selectEditorRecurrenceInterval(editorId));
	const byday = useSelector(selectEditorRecurrenceByDay(editorId));

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
	const [startValue, setStartValue] = useState(() =>
		startValueInitialState(freq, byday, interval, workingSchedule)
	);

	const onByDayChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.QUICK_OPTIONS) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), byday: { wkday: ev } }));
			}
		},
		[radioValue]
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
			if (radioValue === RADIO_VALUES.CUSTOM_OPTIONS) {
				setStartValue((prevValue) => ({
					...prevValue,
					interval: {
						ival: ev
					}
				}));
			}
		},
		[setStartValue, radioValue]
	);

	const onCheckboxClick = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.CUSTOM_OPTIONS) {
				setStartValue((prevValue) => ({
					...prevValue,
					byday: { wkday: ev }
				}));
			}
		},
		[radioValue]
	);

	useEffect(() => {
		if (startValue && frequency === 'WEE') {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === 'WEE' ? (
		<RadioGroup value={radioValue} onChange={onChange}>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Text overflow="break-word">{t('label.every', 'Every')}</Text>
						<Padding horizontal="small">
							<WeekdaySelect
								setSelection={setSelectValue}
								onChange={onByDayChange}
								selection={selectValue}
								disabled={radioValue !== RADIO_VALUES.QUICK_OPTIONS}
							/>
						</Padding>
					</Row>
				}
				value={RADIO_VALUES.QUICK_OPTIONS}
			/>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Container
						orientation="vertical"
						width="fit"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Text overflow="break-word">{t('label.every', 'Every')}</Text>
							<Padding horizontal="small">
								<IntervalInput
									label={t('label.weeks_on', 'Week(s) on')}
									onChange={onInputChange}
									setValue={setInputValue}
									value={inputValue}
									disabled={radioValue !== RADIO_VALUES.CUSTOM_OPTIONS}
								/>
							</Padding>
						</Row>
					</Container>
				}
				value={RADIO_VALUES.CUSTOM_OPTIONS}
			/>
			<Row
				width="fit"
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				wrap="nowrap"
			>
				<WeekdayCheckboxes
					isHidden={radioValue !== RADIO_VALUES.CUSTOM_OPTIONS}
					value={checkboxesValue}
					setValue={setCheckboxesValue}
					onClick={onCheckboxClick}
					disabled={radioValue !== RADIO_VALUES.CUSTOM_OPTIONS}
				/>
			</Row>
		</RadioGroup>
	) : null;
};

export default WeeklyOptions;
