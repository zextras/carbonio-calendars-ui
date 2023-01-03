/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { t } from '@zextras/carbonio-shell-ui';
import { differenceWith, find, isEqual, isNaN, isNil, isNumber, map, omitBy } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	selectEditorRecurrenceCount,
	selectEditorRecurrenceUntilDate
} from '../../../../../store/selectors/editor';
import { RecurrenceContext } from '../contexts';
import RecurrenceEndOptions from './recurrence-end-options';

const RADIO_VALUES = {
	NOT_IMPLEMENTED_1: 'NotImplemented1',
	NOT_IMPLEMENTED_2: 'NotImplemented2'
};

const setEndInitialValue = (count, until) => {
	if (count) return count;
	if (until) return until;
	return undefined;
};

const YearlyOptions = () => {
	const { editorId, frequency } = useContext(RecurrenceContext);
	const count = useSelector(selectEditorRecurrenceCount(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));
	const [radioValue, setRadioValue] = useState(RADIO_VALUES.NOT_IMPLEMENTED_1);

	const [end, setEnd] = useState(() => setEndInitialValue(count, until));
	const [moDayList, setMoDayList] = useState<number | ''>(1);

	const months = useMemo(
		() => [
			{ label: t('months.january', 'January'), value: '1' },
			{ label: t('months.february', 'February'), value: '2' },
			{ label: t('months.march', 'March'), value: '3' },
			{ label: t('months.april', 'April'), value: '4' },
			{ label: t('months.may', 'May'), value: '5' },
			{ label: t('months.june', 'June'), value: '6' },
			{ label: t('months.july', 'July'), value: '7' },
			{ label: t('months.august', 'August'), value: '8' },
			{ label: t('months.september', 'September'), value: '9' },
			{ label: t('months.october', 'October'), value: '10' },
			{ label: t('months.november', 'November'), value: '11' },
			{ label: t('months.december', 'December'), value: '12' }
		],
		[]
	);

	const [byMonthFirstSelectValue, setByMonthFirstSelectValue] = useState(months[0]);
	const [byMonthSecondSelectValue, setByMonthSecondSelectValue] = useState(months[0]);

	const [startValue, setStartValue] = useState({
		bymonthday: {
			modaylist: moDayList
		},
		bymonth: { molist: byMonthFirstSelectValue?.value }
	});

	const onConfirm = useCallback(() => {
		console.log('@@@ yearly footer');
		console.log('@@@ ', frequency, startValue, end);
	}, [frequency, startValue, end]);

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
					if (radioValue === RADIO_VALUES.NOT_IMPLEMENTED_1) {
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

	const onFirstMonthChange = useCallback(
		(ev) => {
			if (ev) {
				const molist = Number(ev);
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(months, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? months[0];
				setByMonthFirstSelectValue(newValue);
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bymonth: { molist } }));
			}
		},
		[months]
	);

	const onSecondMonthChange = useCallback(
		(ev) => {
			if (ev) {
				const molist = Number(ev);
				const selectedValue = ev?.split?.(',');
				const newValue =
					find(months, (item) => {
						const itemValue = item?.value?.split?.(',');
						return differenceWith(itemValue, selectedValue, isEqual).length === 0;
					}) ?? months[0];
				setByMonthSecondSelectValue(newValue);
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bymonth: { molist } }));
			}
		},
		[months]
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

	const [posListSelectValue, setPosListSelectValue] = useState(ordinalNumbers?.[0]);

	const onBySetPosChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.NOT_IMPLEMENTED_2) {
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

	const [byDaySelectValue, setByDaySelectValue] = useState(weekOptions?.[0]);

	const onByDayChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.NOT_IMPLEMENTED_2) {
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

	const onRadioChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.NOT_IMPLEMENTED_1:
					setStartValue({
						bymonthday: {
							modaylist: moDayList
						},
						bymonth: { molist: byMonthFirstSelectValue?.value }
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.NOT_IMPLEMENTED_2:
					setRadioValue(ev);
					setStartValue({
						bysetpos: { poslist: posListSelectValue?.value },
						byday: { wkday: map(byDaySelectValue?.value?.split?.(','), (day) => ({ day })) },
						bymonth: { molist: byMonthSecondSelectValue?.value }
					});
					break;
				default:
					setRadioValue(RADIO_VALUES.NOT_IMPLEMENTED_1);
					break;
			}
		},
		[
			byDaySelectValue?.value,
			byMonthFirstSelectValue?.value,
			byMonthSecondSelectValue?.value,
			moDayList,
			posListSelectValue?.value
		]
	);

	useEffect(() => {
		if (frequency === 'YEA') {
			console.log('@@@ yearly footer');
			console.log('@@@ ', frequency, startValue);
		}
	}, [frequency, startValue]);

	return frequency === 'YEA' ? (
		<>
			<RadioGroup value={radioValue} onChange={onRadioChange}>
				<Radio
					label={
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Padding horizontal="small">
								<Text>{t('label.every_year_on', 'Every year on')}</Text>
							</Padding>
							<Input
								backgroundColor="gray5"
								label={t('label.day', 'Day')}
								value={moDayList}
								onChange={onMoDayListChange}
								disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_1}
								hasError={
									(isNumber(moDayList) && !isNaN(moDayList) && (moDayList < 1 || moDayList > 31)) ||
									!isNumber(moDayList)
								}
							/>
							<Padding horizontal="small">
								<Text>{t('label.of', 'of')}</Text>
							</Padding>
							<Select
								items={months}
								label={t('label.month', 'Month')}
								onChange={onFirstMonthChange}
								disablePortal
								width="fit"
								disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_1}
								selection={byMonthFirstSelectValue}
							/>
						</Row>
					}
					value={RADIO_VALUES.NOT_IMPLEMENTED_1}
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
									onChange={onBySetPosChange}
									disablePortal
									width="fit"
									disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_2}
									selection={posListSelectValue}
								/>
								<Padding horizontal="small" />
								<Select
									items={weekOptions}
									label={t('label.day', 'Day')}
									onChange={onByDayChange}
									disablePortal
									width="fit"
									disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_2}
									selection={byDaySelectValue}
								/>
								<Padding horizontal="small">
									<Text>{t('label.of', 'of')}</Text>
								</Padding>
								<Select
									items={months}
									label={t('label.month', 'Month')}
									onChange={onSecondMonthChange}
									disablePortal
									width="fit"
									disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_2}
									selection={byMonthSecondSelectValue}
								/>
							</Container>
						</Container>
					}
					value={RADIO_VALUES.NOT_IMPLEMENTED_2}
				/>
			</RadioGroup>
			<RecurrenceEndOptions end={end} setEnd={setEnd} />
			<ModalFooter onConfirm={onConfirm} confirmLabel={t('repeat.customize', 'Customize')} />
		</>
	) : null;
};
export default YearlyOptions;
