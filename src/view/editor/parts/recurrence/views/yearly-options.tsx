/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Radio, RadioGroup, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';
import { RECURRENCE_FREQUENCY } from '../../../../../constants/recurrence';
import { RecurrenceStartValue } from '../../../../../types/editor';
import { MonthSelect } from '../components/month-select';
import { MonthlyDayInput } from '../components/monthly-day-input';
import { OrdinalNumberSelect } from '../components/ordinal-number-select';
import WeekdaySelect from '../components/weekday-select';

const RADIO_VALUES = {
	FIRST_RADIO: 'first_radio',
	SECOND_RADIO: 'second_radio'
};

const YearlyOptions = (): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const [radioValue, setRadioValue] = useState(RADIO_VALUES.FIRST_RADIO);

	const [moDayList, setMoDayList] = useState<number | ''>(1);
	const { weekOptions, ordinalNumbers, months } = useRecurrenceItems();

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
			if (radioValue === RADIO_VALUES.FIRST_RADIO) {
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
			if (molist && radioValue === RADIO_VALUES.FIRST_RADIO) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bymonth: { molist } }));
			}
		},
		[radioValue]
	);

	const onSecondMonthChange = useCallback(
		(molist) => {
			if (molist && radioValue === RADIO_VALUES.SECOND_RADIO) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bymonth: { molist } }));
			}
		},
		[radioValue]
	);

	const [posListSelectValue, setPosListSelectValue] = useState(ordinalNumbers?.[0]);

	const onBySetPosChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.SECOND_RADIO) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bysetpos: { poslist: ev } }));
			}
		},
		[radioValue]
	);

	const [byDaySelectValue, setByDaySelectValue] = useState(weekOptions?.[0]);

	const onByDayChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.SECOND_RADIO) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), byday: { wkday: ev } }));
			}
		},
		[radioValue]
	);

	const onRadioChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.FIRST_RADIO:
					setStartValue({
						bymonthday: {
							modaylist: moDayList as number
						},
						bymonth: { molist: byMonthFirstSelectValue?.value }
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.SECOND_RADIO:
					setRadioValue(ev);
					setStartValue({
						bysetpos: { poslist: posListSelectValue?.value },
						byday: { wkday: map(byDaySelectValue?.value?.split?.(','), (day) => ({ day })) },
						bymonth: { molist: byMonthSecondSelectValue?.value }
					});
					break;
				default:
					setRadioValue(RADIO_VALUES.FIRST_RADIO);
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
		if (startValue && frequency === RECURRENCE_FREQUENCY.YEARLY) {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === RECURRENCE_FREQUENCY.YEARLY ? (
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
							disabled={radioValue !== RADIO_VALUES.FIRST_RADIO}
						/>
						<Padding horizontal="small">
							<Text>{t('label.of', 'of')}</Text>
						</Padding>
						<MonthSelect
							value={byMonthFirstSelectValue}
							setValue={setByMonthFirstSelectValue}
							onChange={onFirstMonthChange}
							disabled={radioValue !== RADIO_VALUES.FIRST_RADIO}
						/>
					</Row>
				}
				value={RADIO_VALUES.FIRST_RADIO}
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
								disabled={radioValue !== RADIO_VALUES.SECOND_RADIO}
							/>
							<Padding horizontal="small" />
							<WeekdaySelect
								onChange={onByDayChange}
								disabled={radioValue !== RADIO_VALUES.SECOND_RADIO}
								setSelection={setByDaySelectValue}
							/>
							<Padding horizontal="small">
								<Text>{t('label.of', 'of')}</Text>
							</Padding>
							<MonthSelect
								value={byMonthSecondSelectValue}
								setValue={setByMonthSecondSelectValue}
								onChange={onSecondMonthChange}
								disabled={radioValue !== RADIO_VALUES.SECOND_RADIO}
							/>
						</Container>
					</Container>
				}
				value={RADIO_VALUES.SECOND_RADIO}
			/>
		</RadioGroup>
	) : null;
};

export default YearlyOptions;
