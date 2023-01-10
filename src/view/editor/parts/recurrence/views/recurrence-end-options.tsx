/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { isNaN, isNil, isNumber } from 'lodash';
import moment from 'moment';
import React, { ReactElement, useCallback, useContext, useMemo, useState } from 'react';
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
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import Styler from '../../../../../settings/components/date-picker-style';
import {
	selectEditorAllDay,
	selectEditorRecurrenceCount,
	selectEditorRecurrenceUntilDate,
	selectEditorStart
} from '../../../../../store/selectors/editor';
import { Count } from '../../../../../types/editor';

momentLocalizer();

type SimplifiedCustomDatePickerProps = {
	start: number;
	allDay: boolean | undefined;
	onChange: (d: Date) => void;
	disabled?: boolean;
};

export const SimplifiedCustomDatePicker = ({
	start,
	allDay,
	disabled,
	onChange
}: SimplifiedCustomDatePickerProps): ReactElement => {
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

const radioInitialState = (count: number | undefined, until: string | undefined): string => {
	if (count) {
		return 'end_after_count';
	}
	if (until) {
		return 'end_after_until';
	}
	return 'no_end';
};

const RecurrenceEndOptions = ({ editorId }: { editorId: string }): ReactElement => {
	const { newEndValue, setNewEndValue } = useContext(RecurrenceContext);
	const start = useSelector(selectEditorStart(editorId));
	const allDay = useSelector(selectEditorAllDay(editorId));
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
				setNewEndValue({
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
						setNewEndValue({
							count: {
								num: convertedInputToNumber
							}
						});
					}
				}
			}
		},
		[setNewEndValue, radioValue]
	);

	const onRadioValueChange = useCallback(
		(ev) => {
			switch (ev) {
				case 'no_end':
					setNewEndValue(undefined);
					setRadioValue(ev);
					break;
				case 'end_after_count':
					setNewEndValue({
						count: { num: parseInt(`${inputValue}`, 10) }
					});
					setRadioValue(ev);
					break;
				case 'end_after_until':
					setNewEndValue({
						until: {
							d: moment(pickerValue).format('YYYYMMDD')
						}
					});
					setRadioValue(ev);
					break;
				default:
					setNewEndValue(undefined);
					setRadioValue('no_end');
					break;
			}
		},
		[inputValue, pickerValue, setNewEndValue]
	);

	const onDateChange = useCallback(
		(d) => {
			const fullData = moment(d.valueOf()).format('YYYYMMDD');
			setPickerValue(d.valueOf());
			setNewEndValue({ until: { d: fullData } });
		},
		[setNewEndValue]
	);
	const num = useMemo(() => (newEndValue as Count)?.count?.num, [newEndValue]);

	return (
		<RadioGroup value={radioValue} onChange={onRadioValueChange}>
			<Radio
				size="small"
				iconColor="primary"
				label={t('label.no_end_date', 'No end date')}
				value="no_end"
			/>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Row width="fill" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Row
							width="fit"
							orientation="horizontal"
							mainAlignment="flex-start"
							wrap="nowrap"
							padding={{ right: 'small' }}
						>
							<Text>{t('label.end_after', 'End after')}</Text>
						</Row>
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Input
								backgroundColor="gray5"
								width="fit"
								label={t('label.occurrences', 'Occurence(s)')}
								value={inputValue}
								disabled={radioValue !== 'end_after_count'}
								onChange={onInputValueChange}
								hasError={!isNil(num) && (num > 99 || num < 1 || !isNumber(num))}
							/>
						</Row>
					</Row>
				}
				value="end_after_count"
			/>
			<Radio
				size="small"
				iconColor="primary"
				label={
					<Row width="fill" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
						<Row
							width="fit"
							orientation="horizontal"
							mainAlignment="flex-start"
							wrap="nowrap"
							padding={{ right: 'small' }}
						>
							<Text>{t('label.end_after', 'End after')}</Text>
						</Row>
						<Row width="fit" orientation="horizontal" mainAlignment="flex-start" wrap="nowrap">
							<Styler orientation="horizontal" allDay height="fit" mainAlignment="space-between">
								<SimplifiedCustomDatePicker
									start={initialPickerValue}
									allDay={allDay}
									onChange={onDateChange}
									disabled={radioValue !== 'end_after_until'}
								/>
							</Styler>
						</Row>
					</Row>
				}
				value="end_after_until"
			/>
		</RadioGroup>
	);
};

export default RecurrenceEndOptions;
