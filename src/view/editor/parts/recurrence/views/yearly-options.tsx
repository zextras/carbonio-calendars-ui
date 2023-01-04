/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Radio, RadioGroup, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { RecurrenceStartValue } from '../../../../../types/editor';
import { MonthSelect } from '../components/month-select';
import { MonthlyDayInput } from '../components/monthly-day-input';
import { OrdinalNumberSelect } from '../components/ordinal-number-select';
import WeekdaySelect from '../components/weekday-select';

const RADIO_VALUES = {
	NOT_IMPLEMENTED_1: 'NotImplemented1',
	NOT_IMPLEMENTED_2: 'NotImplemented2'
};

const YearlyOptions = (): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const [radioValue, setRadioValue] = useState(RADIO_VALUES.NOT_IMPLEMENTED_1);

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

	const [startValue, setStartValue] = useState<RecurrenceStartValue>({
		bymonthday: {
			modaylist: moDayList as number
		},
		bymonth: { molist: byMonthFirstSelectValue?.value }
	});

	const onMoDayListChange = useCallback(
		(ev) => {
			if (radioValue === RADIO_VALUES.NOT_IMPLEMENTED_1) {
				setStartValue((prevValue) => ({
					...prevValue,
					interval: {
						ival: ev
					}
				}));
			}
		},
		[radioValue]
	);

	const onFirstMonthChange = useCallback(
		(molist) => {
			if (molist && radioValue === RADIO_VALUES.NOT_IMPLEMENTED_1) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bymonth: { molist } }));
			}
		},
		[radioValue]
	);

	const onSecondMonthChange = useCallback(
		(molist) => {
			if (molist && radioValue === RADIO_VALUES.NOT_IMPLEMENTED_2) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bymonth: { molist } }));
			}
		},
		[radioValue]
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
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bysetpos: { poslist: ev } }));
			}
		},
		[radioValue]
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
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), byday: { wkday: ev } }));
			}
		},
		[radioValue]
	);

	const onRadioChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.NOT_IMPLEMENTED_1:
					setStartValue({
						bymonthday: {
							modaylist: moDayList as number
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
		if (startValue && frequency === 'YEA') {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === 'YEA' ? (
		<RadioGroup value={radioValue} onChange={onRadioChange}>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Padding horizontal="small">
							<Text>{t('label.every_year_on', 'Every year on')}</Text>
						</Padding>
						<MonthlyDayInput
							value={moDayList}
							setValue={setMoDayList}
							onChange={onMoDayListChange}
							disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_1}
						/>
						<Padding horizontal="small">
							<Text>{t('label.of', 'of')}</Text>
						</Padding>
						<MonthSelect
							value={byMonthFirstSelectValue}
							setValue={setByMonthFirstSelectValue}
							onChange={onFirstMonthChange}
							disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_1}
						/>
					</Row>
				}
				value={RADIO_VALUES.NOT_IMPLEMENTED_1}
			/>
			<Radio
				size="small"
				iconColor="primary"
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
							<OrdinalNumberSelect
								value={posListSelectValue}
								setValue={setPosListSelectValue}
								onChange={onBySetPosChange}
								disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_2}
							/>
							<Padding horizontal="small" />
							<WeekdaySelect
								onChange={onByDayChange}
								disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_2}
								setSelection={setByDaySelectValue}
							/>
							<Padding horizontal="small">
								<Text>{t('label.of', 'of')}</Text>
							</Padding>
							<MonthSelect
								value={byMonthSecondSelectValue}
								setValue={setByMonthSecondSelectValue}
								onChange={onSecondMonthChange}
								disabled={radioValue !== RADIO_VALUES.NOT_IMPLEMENTED_2}
							/>
						</Container>
					</Container>
				}
				value={RADIO_VALUES.NOT_IMPLEMENTED_2}
			/>
		</RadioGroup>
	) : null;
};

export default YearlyOptions;
