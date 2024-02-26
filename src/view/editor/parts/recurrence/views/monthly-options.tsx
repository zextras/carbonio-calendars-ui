/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';

import { Container, Padding, Radio, RadioGroup, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from '../../../../../constants/recurrence';
import { RecurrenceStartValue } from '../../../../../types/editor';
import { IntervalInput } from '../components/interval-input';
import { MonthlyDayInput } from '../components/monthly-day-input';
import { OrdinalNumberSelect } from '../components/ordinal-number-select';
import WeekdaySelect from '../components/weekday-select';

const MonthlyOptions = (): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const [radioValue, setRadioValue] = useState(RADIO_VALUES.DAY_OF_MONTH);
	const [moDayList, setMoDayList] = useState<number | ''>(1);
	const [intervalFirstInput, setIntervalFirstInput] = useState<number | ''>(1);
	const [intervalSecondInput, setIntervalSecondInput] = useState<number | ''>(1);

	const [startValue, setStartValue] = useState<RecurrenceStartValue>({
		bymonthday: {
			modaylist: moDayList as number
		},
		interval: {
			ival: intervalFirstInput as number
		}
	});

	const { weekOptions, ordinalNumbers } = useRecurrenceItems();

	const [posListSelectValue, setPosListSelectValue] = useState(ordinalNumbers?.[0]);
	const [byDaySelectValue, setByDaySelectValue] = useState(weekOptions?.[0]);

	const onRadioChange = useCallback(
		(ev) => {
			switch (ev) {
				case RADIO_VALUES.DAY_OF_MONTH:
					setStartValue({
						bymonthday: {
							modaylist: moDayList as number
						},
						interval: {
							ival: intervalFirstInput as number
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
							ival: intervalSecondInput as number
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
			if (ev && radioValue === RADIO_VALUES.DAY_OF_MONTH) {
				setStartValue((prevValue) => ({
					...(prevValue ?? {}),
					bymonthday: {
						modaylist: ev
					}
				}));
			}
		},
		[radioValue]
	);

	const onFirstIntervalChange = useCallback(
		(ev) => {
			if (radioValue === RADIO_VALUES.DAY_OF_MONTH) {
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

	const onSecondIntervalChange = useCallback(
		(ev) => {
			if (radioValue === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
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

	const onBySetPosChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), bysetpos: { poslist: ev } }));
			}
		},
		[radioValue]
	);

	const onByDayChange = useCallback(
		(ev) => {
			if (ev && radioValue === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
				setStartValue((prevValue) => ({ ...(prevValue ?? {}), byday: { wkday: ev } }));
			}
		},
		[radioValue]
	);

	useEffect(() => {
		if (startValue && frequency === RECURRENCE_FREQUENCY.MONTHLY) {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === RECURRENCE_FREQUENCY.MONTHLY ? (
		<RadioGroup value={radioValue} onChange={onRadioChange}>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Padding horizontal="small">
							<Text>{t('label.day', 'Day')}</Text>
						</Padding>
						<MonthlyDayInput
							value={moDayList}
							setValue={setMoDayList}
							onChange={onMoDayListChange}
							disabled={radioValue !== RADIO_VALUES.DAY_OF_MONTH}
							testId={'montly_day_input'}
						/>
						<Padding horizontal="small">
							<Text>{t('label.every', 'every')}</Text>
						</Padding>
						<IntervalInput
							value={intervalFirstInput}
							setValue={setIntervalFirstInput}
							label={t('label.months', 'Months')}
							onChange={onFirstIntervalChange}
							disabled={radioValue !== RADIO_VALUES.DAY_OF_MONTH}
						/>
					</Row>
				}
				value={RADIO_VALUES.DAY_OF_MONTH}
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
								disabled={radioValue !== RADIO_VALUES.MONTHLY_CUSTOMIZED}
							/>
							<Padding horizontal="small" />
							<WeekdaySelect
								setSelection={setByDaySelectValue}
								onChange={onByDayChange}
								selection={byDaySelectValue}
								disabled={radioValue !== RADIO_VALUES.MONTHLY_CUSTOMIZED}
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
							<MonthlyDayInput
								value={intervalSecondInput}
								setValue={setIntervalSecondInput}
								onChange={onSecondIntervalChange}
								disabled={radioValue !== RADIO_VALUES.MONTHLY_CUSTOMIZED}
							/>
							<Padding horizontal="small">
								<Text>{t('label.months', 'Months')}</Text>
							</Padding>
						</Container>
					</Container>
				}
				value={RADIO_VALUES.MONTHLY_CUSTOMIZED}
			/>
		</RadioGroup>
	) : null;
};

export default MonthlyOptions;
