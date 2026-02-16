/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useRef, useState } from 'react';

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

const getDayCodeFromDate = (date: number): string => {
	const dayOfWeek = moment(date).day();
	const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
	return dayMap[dayOfWeek];
};

const checkboxesInitialValue = (
	byDay: Byday | undefined,
	eventStartDate: number | undefined
): { day: string }[] => {
	if (byDay?.wkday?.length) {
		return byDay.wkday;
	}

	if (!eventStartDate) {
		return defaultState.byday.wkday;
	}

	return [{ day: getDayCodeFromDate(eventStartDate) }];
};

export const WeeklyOptions = ({ editorId }: { editorId: string }): ReactElement | null => {
	const { frequency, setNewStartValue } = useContext(RecurrenceContext);
	const editorEventRecurrenceFrequency = useAppSelector(selectEditorRecurrenceFrequency(editorId));
	const editorEventRecurrenceInterval = useAppSelector(selectEditorRecurrenceInterval(editorId));
	const editorEventRecurrenceByDay = useAppSelector(selectEditorRecurrenceByDay(editorId));
	const editorEventStartDate = useAppSelector(selectEditorStart(editorId));

	const hasInitializedRef = useRef(false);

	// Initialize from editor state or event start date
	const [checkboxesValue, setCheckboxesValue] = useState(() =>
		checkboxesInitialValue(editorEventRecurrenceByDay, editorEventStartDate)
	);

	const startValueInitialState = (
		freq: string | undefined,
		interval: Interval | undefined,
		byDay: Byday | undefined,
		initialCheckboxValue: { day: string }[]
	): RecurrenceStartValue | undefined => {
		if (freq === RECURRENCE_FREQUENCY.WEEKLY) {
			const wkday = byDay?.wkday?.length ? byDay.wkday : initialCheckboxValue;
			return { interval, byday: { wkday } };
		}
		return undefined;
	};

	const [startValue, setStartValue] = useState(() =>
		startValueInitialState(
			editorEventRecurrenceFrequency,
			editorEventRecurrenceInterval,
			editorEventRecurrenceByDay,
			checkboxesInitialValue(editorEventRecurrenceByDay, editorEventStartDate)
		)
	);

	const onCheckboxClick = useCallback((ev: Array<{ day: string }>) => {
		if (ev) {
			setStartValue((prevValue) => ({
				...prevValue,
				byday: { wkday: ev }
			}));
		}
	}, []);

	// When frequency changes to WEEKLY, initialize startValue with the auto-selected day
	useEffect(() => {
		if (frequency === RECURRENCE_FREQUENCY.WEEKLY && !hasInitializedRef.current) {
			hasInitializedRef.current = true;
			setStartValue((prevValue) => {
				// Only initialize if startValue doesn't have byday yet
				if (!prevValue?.byday?.wkday?.length) {
					return {
						interval: editorEventRecurrenceInterval ?? { ival: 1 },
						byday: { wkday: checkboxesValue }
					};
				}
				return prevValue;
			});
		}
	}, [frequency, editorEventRecurrenceInterval, checkboxesValue]);

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
