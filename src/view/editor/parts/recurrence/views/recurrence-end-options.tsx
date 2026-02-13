/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useMemo, useState } from 'react';

import {
	Container,
	DateTimePicker,
	Input,
	Padding,
	Radio,
	RadioGroup,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { isNaN, isNil, isNumber } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import momentLocalizer from 'react-widgets-moment';

import { RecurrenceContext } from 'commons/recurrence-context';
import { RADIO_VALUES } from 'constants/recurrence';
import { useAppSelector } from 'store/redux/hooks';
import {
	selectEditorRecurrenceCount,
	selectEditorRecurrenceUntilDate,
	selectEditorStart
} from 'store/selectors/editor';
import { Count } from 'types/editor';

momentLocalizer();

const radioInitialState = (count: number | undefined, until: string | undefined): string => {
	if (count) {
		return RADIO_VALUES.END_AFTER_COUNT;
	}
	if (until) {
		return RADIO_VALUES.END_AFTER_UNTIL;
	}
	return RADIO_VALUES.NO_END_DATE;
};

export const RecurrenceEndOptions = ({ editorId }: { editorId: string }): ReactElement => {
	const { newEndValue, setNewEndValue } = useContext(RecurrenceContext);
	const start = useAppSelector(selectEditorStart(editorId));
	const count = useAppSelector(selectEditorRecurrenceCount(editorId));
	const until = useAppSelector(selectEditorRecurrenceUntilDate(editorId));

	// Determine initial radio value from editor state
	const [radioValue, setRadioValue] = useState(() => radioInitialState(count, until));

	// Initialize input value from editor state
	const [inputValue, setInputValue] = useState(count ?? '1');

	const initialPickerValue = useMemo(
		() =>
			// Use editor value or start date
			until ? new Date(moment(until).valueOf()) : new Date(moment(start).valueOf()),
		[start, until]
	);

	const [pickerValue, setPickerValue] = useState(initialPickerValue);

	const onInputValueChange = useCallback(
		(ev: React.ChangeEvent<HTMLInputElement>) => {
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
		(ev?: string) => {
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

	const num = useMemo(() => (newEndValue as Count)?.count?.num, [newEndValue]);
	const [t] = useTranslation();

	const isDatePickerDisabled = useMemo(
		() => radioValue !== RADIO_VALUES.END_AFTER_UNTIL,
		[radioValue]
	);

	const onDateChange = useCallback(
		(d: Date | null) => {
			if (!isDatePickerDisabled && d) {
				const fullData = moment(d.valueOf()).format('YYYYMMDD');
				setPickerValue(d);
				setNewEndValue({ until: { d: fullData } });
			}
		},
		[isDatePickerDisabled, setNewEndValue]
	);

	const renderNoEndDateLabel = useMemo(
		() => (
			<Row
				style={{ cursor: 'pointer' }}
				width="fill"
				orientation="horizontal"
				mainAlignment="flex-start"
				wrap="nowrap"
			>
				<Row
					width="fill"
					orientation="horizontal"
					mainAlignment="flex-start"
					wrap="nowrap"
					padding={{ right: 'small' }}
				>
					<Text>{t('label.no_end_date', 'No end date')}</Text>
				</Row>
			</Row>
		),
		[t]
	);

	const renderCountLabel = useMemo(
		() => (
			<Row
				style={{ cursor: 'pointer' }}
				width="fill"
				orientation="horizontal"
				mainAlignment="flex-start"
				wrap="nowrap"
				gap="0.5rem"
			>
				<Container
					width="fit"
					minWidth="5rem"
					mainAlignment="flex-start"
					crossAlignment={'flex-start'}
				>
					<Text textAlign={'start'}>{t('label.end_after', 'End after')}</Text>
				</Container>
				<Container width="fill" mainAlignment="flex-start">
					<Input
						background={'gray5'}
						width="fill"
						label={t('label.end_after_events', 'Event(s)')}
						value={inputValue}
						disabled={radioValue !== RADIO_VALUES.END_AFTER_COUNT}
						onChange={onInputValueChange}
						hasError={!isNil(num) && (num > 99 || num < 1 || !isNumber(num))}
					/>
				</Container>
			</Row>
		),
		[inputValue, radioValue, onInputValueChange, num, t]
	);

	const renderDateLabel = useMemo(
		() => (
			<Row
				style={{ cursor: 'pointer' }}
				width="fill"
				orientation="horizontal"
				mainAlignment="flex-start"
				wrap="nowrap"
				gap="0.5rem"
			>
				<Container
					width="fit"
					minWidth="5rem"
					mainAlignment="flex-start"
					crossAlignment={'flex-start'}
				>
					<Text>{t('label.end_on', 'End on')}</Text>
				</Container>
				<Container width="fill" mainAlignment="flex-start">
					<DateTimePicker
						width={'fill'}
						label={t('label.end_after_date', 'Date')}
						showTimeSelect={false}
						defaultValue={initialPickerValue}
						onChange={onDateChange}
						disabled={isDatePickerDisabled}
						dateFormat="dd/MM/yyyy"
					/>
				</Container>
			</Row>
		),
		[initialPickerValue, onDateChange, isDatePickerDisabled, t]
	);

	return (
		<RadioGroup value={radioValue} onChange={onRadioValueChange}>
			<Radio
				key={'no-end-date'}
				size="small"
				iconColor="primary"
				label={renderNoEndDateLabel}
				value={RADIO_VALUES.NO_END_DATE}
			/>
			<Padding key={'padding-1'} bottom={'medium'}></Padding>
			<Radio
				key={'end-after-count'}
				size="small"
				iconColor="primary"
				label={renderCountLabel}
				value={RADIO_VALUES.END_AFTER_COUNT}
			/>
			<Padding key={'padding-2'} bottom={'medium'}></Padding>
			<Radio
				key={'end-after-until'}
				size="small"
				iconColor="primary"
				label={renderDateLabel}
				value={RADIO_VALUES.END_AFTER_UNTIL}
			/>
		</RadioGroup>
	);
};
