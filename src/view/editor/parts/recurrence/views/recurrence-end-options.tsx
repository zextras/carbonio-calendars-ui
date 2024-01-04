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
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import Styler from '../../../../../settings/components/date-picker-style';
import { useAppSelector } from '../../../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorRecurrenceCount,
	selectEditorRecurrenceUntilDate,
	selectEditorStart
} from '../../../../../store/selectors/editor';
import { Count } from '../../../../../types/editor';
import { RADIO_VALUES } from '../../../../../constants/recurrence';

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
		return RADIO_VALUES.END_AFTER_COUNT;
	}
	if (until) {
		return RADIO_VALUES.END_AFTER_UNTIL;
	}
	return RADIO_VALUES.NO_END_DATE;
};

const RecurrenceEndOptions = ({ editorId }: { editorId: string }): ReactElement => {
	const { newEndValue, setNewEndValue } = useContext(RecurrenceContext);
	const start = useAppSelector(selectEditorStart(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const count = useAppSelector(selectEditorRecurrenceCount(editorId));
	const until = useAppSelector(selectEditorRecurrenceUntilDate(editorId));

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
					if (radioValue === RADIO_VALUES.END_AFTER_COUNT) {
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
				case RADIO_VALUES.NO_END_DATE:
					setNewEndValue(undefined);
					setRadioValue(ev);
					break;
				case RADIO_VALUES.END_AFTER_COUNT:
					setNewEndValue({
						count: { num: parseInt(`${inputValue}`, 10) }
					});
					setRadioValue(ev);
					break;
				case RADIO_VALUES.END_AFTER_UNTIL:
					setNewEndValue({
						until: {
							d: moment(pickerValue).format('YYYYMMDD')
						}
					});
					setRadioValue(ev);
					break;
				default:
					setNewEndValue(undefined);
					setRadioValue(RADIO_VALUES.NO_END_DATE);
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
				value={RADIO_VALUES.NO_END_DATE}
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
								disabled={radioValue !== RADIO_VALUES.END_AFTER_COUNT}
								onChange={onInputValueChange}
								hasError={!isNil(num) && (num > 99 || num < 1 || !isNumber(num))}
							/>
						</Row>
					</Row>
				}
				value={RADIO_VALUES.END_AFTER_COUNT}
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
									disabled={radioValue !== RADIO_VALUES.END_AFTER_UNTIL}
								/>
							</Styler>
						</Row>
					</Row>
				}
				value={RADIO_VALUES.END_AFTER_UNTIL}
			/>
		</RadioGroup>
	);
};

export default RecurrenceEndOptions;
