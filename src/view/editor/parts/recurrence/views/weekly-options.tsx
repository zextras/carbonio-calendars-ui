/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';

import { Container, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

import { WeekdayCheckboxes } from '../components/weekday-checkboxes';
import { RecurrenceContext } from 'commons/recurrence-context';
import { RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { useAppSelector } from 'store/redux/hooks';
import {
	selectEditorRecurrenceByDay,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval,
	selectEditorStart
} from 'store/selectors/editor';
import { Byday, Interval, RecurrenceStartValue } from 'types/editor';

const defaultState = {
	interval: {
		ival: 1
	},
	byday: {
		wkday: [{ day: 'MO' }]
	}
};

// Helper function to convert JavaScript day (0-6, Sunday=0) to recurrence format (MO, TU, etc.)
const getDayCodeFromDate = (date: number): string => {
	const dayOfWeek = moment(date).day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
	return dayMap[dayOfWeek];
};

const checkboxesInitialValue = (
	byday: Byday | undefined,
	eventStartDate: number | undefined
): { day: string }[] => {
	// If we have existing byday value, use it
	if (byday?.wkday && byday.wkday.length > 0) {
		return byday.wkday;
	}
	// Otherwise, use the day of the week from the event's start date
	if (eventStartDate) {
		const dayCode = getDayCodeFromDate(eventStartDate);
		return [{ day: dayCode }];
	}
	// Fallback to Monday
	return defaultState.byday.wkday;
};

const startValueInitialState = (
	freq: string | undefined,
	interval: Interval | undefined,
	byday: Byday | undefined
): RecurrenceStartValue | undefined => {
	if (freq === RECURRENCE_FREQUENCY.WEEKLY) {
		return { interval, byday };
	}
	return undefined;
};

export const WeeklyOptions = ({ editorId }: { editorId: string }): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const freq = useAppSelector(selectEditorRecurrenceFrequency(editorId));
	const interval = useAppSelector(selectEditorRecurrenceInterval(editorId));
	const byDay = useAppSelector(selectEditorRecurrenceByDay(editorId));
	const start = useAppSelector(selectEditorStart(editorId));

	const [checkboxesValue, setCheckboxesValue] = useState(() =>
		checkboxesInitialValue(byDay, start)
	);
	const [startValue, setStartValue] = useState(() => startValueInitialState(freq, interval, byDay));

	const onCheckboxClick = useCallback((ev: Array<{ day: string }>) => {
		if (ev) {
			setStartValue((prevValue) => ({
				...prevValue,
				byday: { wkday: ev }
			}));
		}
	}, []);

	useEffect(() => {
		if (startValue && frequency === RECURRENCE_FREQUENCY.WEEKLY) {
			setNewStartValue(startValue);
		}
	}, [frequency, setNewStartValue, startValue]);

	return frequency === RECURRENCE_FREQUENCY.WEEKLY ? (
		<Container
			orientation="vertical"
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			width={'fill'}
		>
			<Padding vertical="medium">
				<Text weight="bold" size="large">
					{t('label.on', 'On')}
				</Text>
			</Padding>
			<Row
				width="fill"
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				wrap="nowrap"
			>
				<WeekdayCheckboxes
					isHidden={false}
					value={checkboxesValue}
					setValue={setCheckboxesValue}
					onClick={onCheckboxClick}
					disabled={false}
				/>
			</Row>
		</Container>
	) : null;
};
