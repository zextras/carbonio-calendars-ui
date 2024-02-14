/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Container, Radio, RadioGroup, Row, Text, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { find, differenceWith, map, isEqual, filter, omitBy, isNil } from 'lodash';

import { usePrefs } from '../../../../../carbonio-ui-commons/utils/use-prefs';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';
import { WEEK_SCHEDULE } from '../../../../../constants/calendar';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from '../../../../../constants/recurrence';
import { useAppSelector } from '../../../../../store/redux/hooks';
import {
	selectEditorRecurrenceByDay,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval
} from '../../../../../store/selectors/editor';
import { Byday, Interval, RecurrenceStartValue } from '../../../../../types/editor';
import { workWeek, WorkWeekDay } from '../../../../../utils/work-week';
import { IntervalInput } from '../components/interval-input';
import { WeekdayCheckboxes } from '../components/weekday-checkboxes';
import WeekdaySelect from '../components/weekday-select';

const defaultState = {
	freq: RECURRENCE_FREQUENCY.WEEKLY,
	interval: {
		ival: 1
	},
	byday: {
		wkday: [{ day: 'MO' }]
	},
	radioValue: RADIO_VALUES.QUICK_OPTIONS
};

const radioInitialState = (
	freq: string | undefined,
	interval: Interval | undefined,
	byday: Byday | undefined,
	workingSchedule: WorkWeekDay[]
): string => {
	if (
		(freq === RECURRENCE_FREQUENCY.DAILY || freq === RECURRENCE_FREQUENCY.WEEKLY) &&
		byday?.wkday
	) {
		// building an array with the same structure of wkday to check if they have the same values
		// to determine if we are receiving the value of the working day option
		const workingDays = map(filter(workingSchedule, ['working', true]), (workingDay) => {
			const day = find(WEEK_SCHEDULE, ['value', workingDay.day])?.label?.slice(0, 2);
			return { day };
		});
		const diff = differenceWith(workingDays, byday?.wkday, isEqual);
		if (diff?.length === 0 && interval?.ival === 1) {
			return RADIO_VALUES.QUICK_OPTIONS;
		}
		return RADIO_VALUES.CUSTOM_OPTIONS;
	}
	if (freq === RECURRENCE_FREQUENCY.WEEKLY) {
		if (interval?.ival === 1) {
			return RADIO_VALUES.QUICK_OPTIONS;
		}
		return RADIO_VALUES.CUSTOM_OPTIONS;
	}
	return defaultState.radioValue;
};

const startValueInitialState = (
	freq: string | undefined,
	interval: Interval | undefined,
	byday: Byday | undefined,
	weeklyOptions: { label: string; value: string }[]
): RecurrenceStartValue | undefined => {
	if (freq === RECURRENCE_FREQUENCY.WEEKLY) {
		return omitBy({ interval, byday }, isNil);
	}
	if (freq === RECURRENCE_FREQUENCY.DAILY && byday?.wkday && interval?.ival === 1) {
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
	return undefined;
};

const selectInitialValue = (
	weeklyOptions: { label: string; value: string }[],
	byday: Byday | undefined
): { label: string; value: string } =>
	find(
		weeklyOptions,
		(item) =>
			differenceWith(
				map(item?.value?.split?.(','), (day) => ({ day })),
				byday?.wkday ?? [],
				isEqual
			).length === 0
	) ?? weeklyOptions[0];

const WeeklyOptions = ({ editorId }: { editorId: string }): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const freq = useAppSelector(selectEditorRecurrenceFrequency(editorId));
	const interval = useAppSelector(selectEditorRecurrenceInterval(editorId));
	const byday = useAppSelector(selectEditorRecurrenceByDay(editorId));

	const prefs = usePrefs();

	const workingSchedule = useMemo(
		() => workWeek(prefs.zimbraPrefCalendarWorkingHours),
		[prefs?.zimbraPrefCalendarWorkingHours]
	);

	const { weekOptions } = useRecurrenceItems();

	const [radioValue, setRadioValue] = useState(() =>
		radioInitialState(freq, interval, byday, workingSchedule)
	);
	const [inputValue, setInputValue] = useState<number | ''>(interval?.ival ?? 1);
	const [selectValue, setSelectValue] = useState(() => selectInitialValue(weekOptions, byday));
	const [checkboxesValue, setCheckboxesValue] = useState(byday?.wkday ?? []);
	const [startValue, setStartValue] = useState(() =>
		startValueInitialState(freq, interval, byday, weekOptions)
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
						interval: { ival: inputValue as number }
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
		if (startValue && frequency === RECURRENCE_FREQUENCY.WEEKLY) {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === RECURRENCE_FREQUENCY.WEEKLY ? (
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
				name={RADIO_VALUES.QUICK_OPTIONS}
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
