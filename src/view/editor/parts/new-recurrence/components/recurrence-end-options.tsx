/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { isNaN, isNil, isNumber } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import {
	Container,
	Icon,
	Input,
	Padding,
	Radio,
	RadioGroup,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { useSelector } from 'react-redux';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import Styler from '../../../../../settings/components/date-picker-style';
import {
	selectEditorAllDay,
	selectEditorRecurrenceCount,
	selectEditorRecurrenceUntilDate,
	selectEditorStart
} from '../../../../../store/selectors/editor';

momentLocalizer();

export const SimplifiedCustomDatePicker = ({ start, allDay, disabled, onChange }) => {
	const startDate = useMemo(() => new Date(start), [start]);

	return (
		<>
			<Styler
				allDay={allDay}
				orientation="horizontal"
				height="fit"
				mainAlignment="flex-start"
				backgroundColor="gray5"
			>
				<Container crossAlignment="flex-start" style={{ maxWidth: '31.25rem' }}>
					<DateTimePicker
						time={false}
						valueFormat={{ month: 'short', year: 'numeric' }}
						defaultValue={startDate}
						onChange={onChange}
						disabled={disabled}
						format="DD MMM YYYY"
						dateIcon={
							<Padding all="small">
								<Icon icon="CalendarOutline" />
							</Padding>
						}
					/>
				</Container>
			</Styler>
		</>
	);
};

const RecurrenceEndOptions = ({ editorId, callbacks }) => {
	const start = useSelector(selectEditorStart(editorId));
	const allDay = useSelector(selectEditorAllDay);
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));
	const count = useSelector(selectEditorRecurrenceCount(editorId));

	const [radioValue, setRadioValue] = useState('no_end');
	const [inputValue, setInputValue] = useState(until);

	const onRadioValueChange = useCallback((ev) => {
		setRadioValue(ev);
	}, []);

	const onInputValueChane = useCallback((ev) => {
		setInputValue(ev);
	}, []);
	return (
		<RadioGroup value={radioValue} onChange={onRadioValueChange}>
			<Radio label={t('label.no_end_date', 'No end date')} value="no_end" />
			<Radio
				label={
					<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Text overflow="break-word">{t('label.end_after', 'End after')}</Text>
						<Input
							backgroundColor="gray5"
							label={t('label.occurrences', 'Occurence(s)')}
							value={inputValue}
							onChange={onInputValueChane}
							hasError={!isNil(count) && (count > 99 || count < 1 || !isNumber(count))}
						/>
					</Row>
				}
				value="end_after_count"
			/>
			<Radio
				label={
					<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Text overflow="break-word">{t('label.end_after', 'End after')}</Text>
						<Styler orientation="horizontal" allDay height="fit" mainAlignment="space-between">
							<Container padding={{ all: 'small' }}>
								<SimplifiedCustomDatePicker
									start={start}
									allDay={allDay}
									onChange={() => null}
								/>
							</Container>
						</Styler>
					</Row>
				}
				value="end_after_until"
			/>
		</RadioGroup>
	);
};

export default RecurrenceEndOptions;
