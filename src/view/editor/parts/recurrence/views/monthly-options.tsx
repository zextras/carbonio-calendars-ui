/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Container, Padding, Radio, RadioGroup, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

import { RecurrenceContext } from 'commons/recurrence-context';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { useAppSelector } from 'store/redux/hooks';
import { selectEditorStart } from 'store/selectors/editor';
import { RecurrenceStartValue } from 'types/editor';

const getOrdinalSuffix = (day: number): string => {
	if (day > 3 && day < 21) return 'th';
	switch (day % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
};

const getOrdinalNumber = (num: number): string => {
	const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
	if (num >= 1 && num <= 5) {
		return ordinals[num - 1];
	}
	if (num === -1) {
		return 'Last';
	}
	return `${num}${getOrdinalSuffix(num)}`;
};

export const MonthlyOptions = ({ editorId }: { editorId: string }): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const start = useAppSelector(selectEditorStart(editorId));

	const [radioValue, setRadioValue] = useState(RADIO_VALUES.DAY_OF_MONTH);

	// Calculate day of month from start date
	const dayOfMonth = useMemo(() => {
		if (!start) return 1;
		return moment(start).date();
	}, [start]);

	// Calculate ordinal position and weekday from start date
	const { ordinalPosition, weekdayName, weekdayCode } = useMemo(() => {
		if (!start) {
			return { ordinalPosition: 1, weekdayName: 'Monday', weekdayCode: 'MO' };
		}
		const date = moment(start);
		const dayOfWeek = date.day(); // 0 = Sunday, 6 = Saturday
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

		// Calculate which occurrence of this weekday in the month (1st, 2nd, 3rd, etc.)
		const currentDayOfMonth = date.date();
		const occurrence = Math.ceil(currentDayOfMonth / 7);

		return {
			ordinalPosition: occurrence,
			weekdayName: dayNames[dayOfWeek],
			weekdayCode: dayCodes[dayOfWeek]
		};
	}, [start]);

	const dayOfMonthLabel = useMemo(
		() => `${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} of the Month`,
		[dayOfMonth]
	);

	const customDayLabel = useMemo(
		() => `Every ${getOrdinalNumber(ordinalPosition).toLowerCase()} ${weekdayName} of the Month`,
		[ordinalPosition, weekdayName]
	);

	const [startValue, setStartValue] = useState<RecurrenceStartValue>({
		bymonthday: {
			modaylist: dayOfMonth
		}
	});

	const onRadioChange = useCallback(
		(ev?: string) => {
			switch (ev) {
				case RADIO_VALUES.DAY_OF_MONTH:
					setStartValue({
						bymonthday: {
							modaylist: dayOfMonth
						}
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.MONTHLY_CUSTOMIZED:
					setRadioValue(ev);
					setStartValue({
						bysetpos: { poslist: ordinalPosition.toString() },
						byday: { wkday: [{ day: weekdayCode }] }
					});
					break;
				default:
					setRadioValue(RADIO_VALUES.DAY_OF_MONTH);
					break;
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
						size={'small'}
						key={'day_of_month'}
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
						size={'small'}
						key={'custom'}
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
