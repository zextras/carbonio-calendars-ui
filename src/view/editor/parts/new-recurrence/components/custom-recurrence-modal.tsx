/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	selectEditorRecurrenceByDay,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval,
	selectEditorRecurrenceUntilDate
} from '../../../../../store/selectors/editor';
import { RecurrenceContext } from '../contexts';
import DailyOptions from './daily-options';
import FrequencySelect from './frequency-select';
import RecurrenceEndOptions from './recurrence-end-options';

const CustomRecurrenceModal = ({ editorId, callbacks }) => {
	const freq = useSelector(selectEditorRecurrenceFrequency(editorId));
	const ival = useSelector(selectEditorRecurrenceInterval(editorId));
	const byday = useSelector(selectEditorRecurrenceByDay(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));

	const [frequency, setFrequency] = useState(freq);
	const [interval, setInterval] = useState(ival);
	const [byWeekDay, setByWeekDay] = useState(byday);
	const [untilDate, setUntilDate] = useState(until);

	useEffect(() => {
		console.log(frequency, interval, byWeekDay, untilDate);
	}, [byWeekDay, frequency, interval, untilDate]);

	return (
		<RecurrenceContext.Provider
			value={{
				frequency,
				setFrequency,
				ival: interval,
				setIval: setInterval,
				byWeekDay,
				setByWeekDay,
				untilDate,
				setUntilDate
			}}
		>
			<FrequencySelect />
			{frequency === 'DAI' && <DailyOptions />}
			<RecurrenceEndOptions editorId={editorId} callbacks={callbacks} />
		</RecurrenceContext.Provider>
	);
};

export default CustomRecurrenceModal;
