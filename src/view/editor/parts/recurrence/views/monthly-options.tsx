/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Container, Padding, Radio, RadioGroup, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

import { calculateOrdinalPosition } from './monthly-options-utils';
import { RecurrenceContext } from 'commons/recurrence-context';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { useAppSelector } from 'store/redux/hooks';
import { selectEditorStart } from 'store/selectors/editor';
import { RecurrenceStartValue } from 'types/editor';

const getOrdinalSuffix = (
	day: number,
	tFn: (key: string, defaultValue: string) => string
): string => {
	if (day > 3 && day < 21) return tFn('ordinal.suffix.th', 'th');
	switch (day % 10) {
		case 1:
			return tFn('ordinal.suffix.st', 'st');
		case 2:
			return tFn('ordinal.suffix.nd', 'nd');
		case 3:
			return tFn('ordinal.suffix.rd', 'rd');
		default:
			return tFn('ordinal.suffix.th', 'th');
	}
};

const getOrdinalNumber = (
	num: number,
	tFn: (key: string, defaultValue: string) => string
): string => {
	if (num === 1) return tFn('ordinal.first', 'First');
	if (num === 2) return tFn('ordinal.second', 'Second');
	if (num === 3) return tFn('ordinal.third', 'Third');
	if (num === 4) return tFn('ordinal.fourth', 'Fourth');
	if (num === 5) return tFn('ordinal.fifth', 'Fifth');
	if (num === -1) return tFn('ordinal.last', 'Last');
	return `${num}${getOrdinalSuffix(num, tFn)}`;
};

const getWeekdayName = (
	dayCode: string,
	tFn: (key: string, defaultValue: string) => string
): string => {
	const weekdayMap: Record<string, string> = {
		SU: tFn('label.week_day.sunday', 'Sunday'),
		MO: tFn('label.week_day.monday', 'Monday'),
		TU: tFn('label.week_day.tuesday', 'Tuesday'),
		WE: tFn('label.week_day.wednesday', 'Wednesday'),
		TH: tFn('label.week_day.thursday', 'Thursday'),
		FR: tFn('label.week_day.friday', 'Friday'),
		SA: tFn('label.week_day.saturday', 'Saturday')
	};
	return weekdayMap[dayCode] || dayCode;
};

export const MonthlyOptions = ({ editorId }: { editorId: string }): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const editorEventStartDate = useAppSelector(selectEditorStart(editorId));

	const [radioValue, setRadioValue] = useState(RADIO_VALUES.DAY_OF_MONTH);

	// Calculate day of month from start date
	const dayOfMonth = useMemo(() => {
		if (!editorEventStartDate) return 1;
		return moment(editorEventStartDate).date();
	}, [editorEventStartDate]);

	// Calculate ordinal position and weekday from start date
	const { ordinalPosition, weekdayCode } = useMemo(() => {
		if (!editorEventStartDate) {
			return { ordinalPosition: 1, weekdayCode: 'MO' };
		}
		return calculateOrdinalPosition(editorEventStartDate);
	}, [editorEventStartDate]);

	const dayOfMonthLabel = useMemo(
		() =>
			t('label.day_of_month_recurrence', '{{day}} of the Month', {
				day: `${dayOfMonth}${getOrdinalSuffix(dayOfMonth, t)}`
			}),
		[dayOfMonth]
	);

	const customDayLabel = useMemo(
		() =>
			t('label.ordinal_weekday_of_month', 'Every {{ordinal}} {{weekday}} of the Month', {
				ordinal: getOrdinalNumber(ordinalPosition, t).toLowerCase(),
				weekday: getWeekdayName(weekdayCode, t)
			}),
		[ordinalPosition, weekdayCode]
	);

	const [startValue, setStartValue] = useState<RecurrenceStartValue>(() => ({
		// Initialize with day of month
		bymonthday: {
			modaylist: dayOfMonth
		}
	}));

	const onRadioChange = useCallback(
		(ev?: string) => {
			if (ev === RADIO_VALUES.DAY_OF_MONTH) {
				setStartValue({
					bymonthday: {
						modaylist: dayOfMonth
					}
				});
				setRadioValue(ev);
			} else if (ev === RADIO_VALUES.MONTHLY_CUSTOMIZED) {
				setRadioValue(ev);
				setStartValue({
					bysetpos: { poslist: ordinalPosition.toString() },
					byday: { wkday: [{ day: weekdayCode }] }
				});
			} else {
				setRadioValue(RADIO_VALUES.DAY_OF_MONTH);
			}
		},
		[dayOfMonth, ordinalPosition, weekdayCode]
	);

	useEffect(() => {
		if (startValue && frequency === RECURRENCE_FREQUENCY.MONTHLY) {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === RECURRENCE_FREQUENCY.MONTHLY ? (
		<Container
			orientation="vertical"
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			width={'fill'}
			gap={'1rem'}
		>
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
			>
				<Padding vertical="medium">
					<Text weight="bold" size="large">
						{t('label.on', 'On')}
					</Text>
				</Padding>
				<RadioGroup value={radioValue} onChange={onRadioChange}>
					<Radio
						data-testid="monthly-option-day-of-month"
						key={'day_of_month'}
						size={'small'}
						iconColor="primary"
						label={
							<Row
								style={{ cursor: 'pointer' }}
								width="fill"
								orientation="horizontal"
								mainAlignment="flex-start"
								wrap="nowrap"
							>
								<Text>{dayOfMonthLabel}</Text>
							</Row>
						}
						value={RADIO_VALUES.DAY_OF_MONTH}
					/>
					<Padding key={'padding-1'} top="medium" />
					<Radio
						data-testid="monthly-option-ordinal-weekday"
						key={'custom'}
						size={'small'}
						iconColor="primary"
						label={
							<Row
								style={{ cursor: 'pointer' }}
								width="fill"
								orientation="horizontal"
								mainAlignment="flex-start"
								wrap="nowrap"
							>
								<Text>{customDayLabel}</Text>
							</Row>
						}
						value={RADIO_VALUES.MONTHLY_CUSTOMIZED}
					/>
				</RadioGroup>
			</Container>
		</Container>
	) : null;
};
