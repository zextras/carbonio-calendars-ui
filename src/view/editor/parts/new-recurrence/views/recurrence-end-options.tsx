/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { isNaN, isNil, isNumber } from 'lodash';
import moment from 'moment';
import React, { useCallback, useContext, useMemo, useState } from 'react';
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
import { RecurrenceContext } from '../contexts';

momentLocalizer();

export const SimplifiedCustomDatePicker = ({ start, allDay, onChange }) => {
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

const radioInitialState = (count, until) => {
	if (count) {
		return 'end_after_count';
	}
	if (until) {
		return 'end_after_until';
	}
	return 'no_end';
};

const RecurrenceEndOptions = ({ end, setEnd }) => {
	const { editorId } = useContext(RecurrenceContext);
	const start = useSelector(selectEditorStart(editorId));
	const allDay = useSelector(selectEditorAllDay);
	const count = useSelector(selectEditorRecurrenceCount(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));

	const [radioValue, setRadioValue] = useState(() => radioInitialState(count, until));
	const [inputValue, setInputValue] = useState(count ?? '1');

	const initialPickerValue = useMemo(
		() => (until ? moment(until).valueOf() : start ?? new Date().valueOf()),
		[start, until]
	);

	const [pickerValue, setPickerValue] = useState(initialPickerValue);

	const onInputValueChange = useCallback(
		(ev) => {
			if (ev.target.value === '') {
				setEnd({
					count: { num: 1 }
				});
				setInputValue(ev.target.value);
			} else {
				const convertedInputToNumber = parseInt(ev.target.value, 10);
				if (
					isNumber(convertedInputToNumber) &&
					!isNaN(convertedInputToNumber) &&
					convertedInputToNumber > 0
				) {
					setInputValue(convertedInputToNumber);
					if (radioValue === 'end_after_count') {
						setEnd({
							count: {
								num: convertedInputToNumber
							}
						});
					}
				}
			}
		},
		[setEnd, radioValue]
	);

	const onRadioValueChange = useCallback(
		(ev) => {
			switch (ev) {
				case 'no_end':
					setEnd(undefined);
					setRadioValue(ev);
					break;
				case 'end_after_count':
					setEnd({
						count: { num: inputValue }
					});
					setRadioValue(ev);
					break;
				case 'end_after_until':
					setEnd({
						until: {
							d: moment(pickerValue).format('YYYYMMDD')
						}
					});
					setRadioValue(ev);
					break;
				default:
					setEnd(undefined);
					setRadioValue('no_end');
					break;
			}
		},
		[inputValue, pickerValue, setEnd]
	);

	const onDateChange = useCallback(
		(d) => {
			const fullData = moment(d.valueOf()).format('YYYYMMDD');
			setPickerValue(d.valueOf());
			setEnd({ until: { d: fullData } });
		},
		[setEnd]
	);
	const num = useMemo(() => parseInt(end?.count?.num, 10), [end?.count?.num]);

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
							onChange={onInputValueChange}
							hasError={!isNil(num) && (num > 99 || num < 1 || !isNumber(num))}
						/>
					</Row>
				}
				value="end_after_count"
			/>
			<Radio
				label={
					<Row
						width="fit"
						orientation="horizontal"
						mainAlignment="flex-start"
						wrap="nowrap"
						onClick={(ev) => {
							// used to block onChange from Radio - todo: remove once CDS - 108 is completed
							ev.stopPropagation();
						}}
					>
						<Text overflow="break-word">{t('label.end_after', 'End after')}</Text>
						<Styler orientation="horizontal" allDay height="fit" mainAlignment="space-between">
							<Container padding={{ all: 'small' }}>
								<SimplifiedCustomDatePicker
									start={initialPickerValue}
									allDay={allDay}
									onChange={onDateChange}
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
