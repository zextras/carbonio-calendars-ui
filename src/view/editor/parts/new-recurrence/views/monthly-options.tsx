/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	ModalFooter,
	Padding,
	Radio,
	RadioGroup,
	Row,
	Select,
	Text
} from '@zextras/carbonio-design-system';
import { isNumber, isNaN, map, find, differenceWith, isEqual, isNil, omitBy } from 'lodash';
import { useSelector } from 'react-redux';
import {
	selectEditorRecurrenceCount,
	selectEditorRecurrenceUntilDate
} from '../../../../../store/selectors/editor';
import { RecurrenceContext } from '../contexts';
import RecurrenceEndOptions from './recurrence-end-options';

const RADIO_VALUES = {
	DAY_OF_MONTH: 'DayOfTheMonth',
	MONTHLY_CUSTOMIZED: 'MonthlyCustomized'
};

const setEndInitialValue = (count, until) => {
	if (count) return count;
	if (until) return until;
	return undefined;
};

const MonthlyOptions = () => {
	const { editorId, frequency } = useContext(RecurrenceContext);
	const count = useSelector(selectEditorRecurrenceCount(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));
	const [radioValue, setRadioValue] = useState(RADIO_VALUES.DAY_OF_MONTH);
	const [moDayList, setMoDayList] = useState<number | ''>(1);
	const [intervalFirstInput, setIntervalFirstInput] = useState<number | ''>(1);
	const [intervalSecondInput, setIntervalSecondInput] = useState<number | ''>(1);

	const [end, setEnd] = useState(() => setEndInitialValue(count, until));

	const [startValue, setStartValue] = useState();

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

	const weekOptions = useMemo(
		() => [
			{ label: t('label.day', 'Day'), value: 'MO,TU,WE,TH,FR,SA,SU' },
			{ label: t('items.weekend_day', 'Weekend day'), value: 'SA,SU' },
			{ label: t('items.working_day', 'Working day'), value: 'MO,TU,WE,TH,FR' },
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

	const [posListSelectValue, setPosListSelectValue] = useState(ordinalNumbers?.[0]);
	const [byDaySelectValue, setByDaySelectValue] = useState(weekOptions?.[0]);

	const onRadioChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.DAY_OF_MONTH:
					setStartValue({
						bymonthday: {
							modaylist: moDayList
						},
						interval: {
							ival: intervalFirstInput
						}
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.MONTHLY_CUSTOMIZED:
					setRadioValue(ev);
					setStartValue({
						bysetpos: { poslist: posListSelectValue?.value },
						byday: { wkday: map(byDaySelectValue?.value?.split?.(','), (day) => ({ day })) },
						interval: {
							ival: intervalSecondInput
						}
					});
					break;
				default:
					setRadioValue(RADIO_VALUES.DAY_OF_MONTH);
					break;
			}
		},
		[
			byDaySelectValue?.value,
			intervalFirstInput,
			intervalSecondInput,
			moDayList,
			posListSelectValue?.value
		]
	);

	const onMoDayListChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setStartValue((prevValue) => ({
					...(prevValue ?? {}),
					bymonthday: {
						modaylist: 1
					}
				}));
				setMoDayList(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber >= 0
				) {
					setMoDayList(convertedInputToNumber);
					if (radioValue === RADIO_VALUES.DAY_OF_MONTH) {
						setStartValue((prevValue) => ({
							...(prevValue ?? {}),
							bymonthday: {
								modaylist: convertedInputToNumber
							}
						}));
					}
				}
			}
		},
		[radioValue]
	);

	const onFirstIntervalChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setStartValue((prevValue) => ({
					...(prevValue ?? {}), // todo: consider to use controlled value insted of its previous
					interval: {
						ival: 1
					}
				}));
				setIntervalFirstInput(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber >= 0
				) {
					setIntervalFirstInput(convertedInputToNumber);
					if (radioValue === RADIO_VALUES.DAY_OF_MONTH) {
						setStartValue((prevValue) => ({
							...(prevValue ?? {}),
							interval: {
								ival: convertedInputToNumber
							}
						}));
					}
				}
			}
		},
		[radioValue]
	);

	const onSecondIntervalChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setStartValue((prevValue) => ({
					...(prevValue ?? {}), // todo: consider to use controlled value insted of its previous
					interval: {
						ival: 1
					}
				}));
				setIntervalSecondInput(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber >= 0
				) {
					setIntervalSecondInput(convertedInputToNumber);
					if (radioValue === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
						setStartValue((prevValue) => ({
							...(prevValue ?? {}),
							interval: {
								ival: convertedInputToNumber
							}
						}));
					}
				}
			}
		},
		[radioValue]
	);

	const onBySetPosChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(ordinalNumbers, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? ordinalNumbers[0];
				setPosListSelectValue(newValue);
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bysetpos: { poslist: ev } }));
			}
		},
		[ordinalNumbers, radioValue]
	);

	const onByDayChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
				const days = map(ev?.split?.(','), (day) => ({ day }));
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(weekOptions, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? weekOptions[0];
				setByDaySelectValue(newValue);
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), byday: { wkday: days } }));
			}
		},
		[radioValue, weekOptions]
	);

	useEffect(() => {
		if (frequency === 'MON') {
			console.log('@@@ monthly footer');
			console.log('@@@ ', frequency, startValue);
		}
	}, [frequency, startValue]);

	const onConfirm = useCallback(() => {
		console.log('@@@ weekly footer');
		console.log('@@@ ', frequency, startValue, end);
	}, [frequency, startValue, end]);

	return frequency === 'MON' ? (
		<>
			<RadioGroup value={radioValue} onChange={onRadioChange}>
				<Radio
					label={
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Padding horizontal="small">
								<Text>{t('label.day', 'Day')}</Text>
							</Padding>
							<Input
								backgroundColor="gray5"
								label={t('label.day', 'Day')}
								value={moDayList}
								onChange={onMoDayListChange}
								disabled={radioValue !== RADIO_VALUES.DAY_OF_MONTH}
								hasError={
									(isNumber(moDayList) && !isNaN(moDayList) && (moDayList < 1 || moDayList > 31)) ||
									!isNumber(moDayList)
								}
							/>
							<Padding horizontal="small">
								<Text>{t('label.every', 'every')}</Text>
							</Padding>
							<Input
								label={t('label.months', 'Months')}
								onChange={onFirstIntervalChange}
								backgroundColor="gray5"
								disabled={radioValue !== RADIO_VALUES.DAY_OF_MONTH}
								value={intervalFirstInput}
								hasError={
									(isNumber(intervalFirstInput) &&
										!isNaN(intervalFirstInput) &&
										(intervalFirstInput < 1 || intervalFirstInput > 99)) ||
									!isNumber(intervalFirstInput)
								}
							/>
						</Row>
					}
					value={RADIO_VALUES.DAY_OF_MONTH}
				/>
				<Radio
					label={
						<Container
							orientation="vertical"
							mainAlignment="center"
							crossAlignment="flex-start"
							width="100%"
						>
							<Padding horizontal="small">
								<Text>{t('label.the', 'The')}</Text>
							</Padding>
							<Select
								items={ordinalNumbers}
								label={t('label.number', 'Number')}
								onChange={onBySetPosChange}
								disablePortal
								width="fit"
								disabled={radioValue !== RADIO_VALUES.MONTHLY_CUSTOMIZED}
								selection={posListSelectValue}
							/>
							<Padding horizontal="small" />
							<Select
								items={weekOptions}
								label={t('label.day', 'Day')}
								onChange={onByDayChange}
								disablePortal
								width="fit"
								disabled={radioValue !== RADIO_VALUES.MONTHLY_CUSTOMIZED}
								selection={byDaySelectValue}
							/>
							<Padding horizontal="small">
								<Text>{t('label.of_every_month', 'of the month, every')}</Text>
							</Padding>
							<Input
								label={t('label.month', 'Month')}
								onChange={onSecondIntervalChange}
								backgroundColor="gray5"
								disabled={radioValue !== RADIO_VALUES.MONTHLY_CUSTOMIZED}
								value={intervalSecondInput}
								hasError={
									(isNumber(intervalSecondInput) &&
										!isNaN(intervalSecondInput) &&
										(intervalSecondInput < 1 || intervalSecondInput > 99)) ||
									!isNumber(intervalSecondInput)
								}
							/>
							<Padding horizontal="small">
								<Text>{t('label.months', 'Months')}</Text>
							</Padding>
						</Container>
					}
					value={RADIO_VALUES.MONTHLY_CUSTOMIZED}
				/>
			</RadioGroup>
			<RecurrenceEndOptions end={end} setEnd={setEnd} />
			<ModalFooter onConfirm={onConfirm} confirmLabel={t('repeat.customize', 'Customize')} />
		</>
	) : null;
};

export default MonthlyOptions;
