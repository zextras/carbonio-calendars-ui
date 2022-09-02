/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useCallback, useMemo, useState } from 'react';
import { Container, Input, Padding, Text, Icon } from '@zextras/carbonio-design-system';
import { isNaN } from 'lodash';
import { useSelector } from 'react-redux';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import Styler from '../../../../settings/components/date-picker-style';
import { selectStart } from '../../../../store/selectors/calendars';
import { selectEditorAllDay } from '../../../../store/selectors/editor';

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
				<Container crossAlignment="flex-start" style={{ maxWidth: '500px' }}>
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

export const SetCustomEnd = ({ customEndValue, setCustomEndValue }) => {
	const [t] = useTranslation();
	const start = useSelector(selectStart);
	const allDay = useSelector(selectEditorAllDay);
	const [isOccurrenceDisabled, setIsOccurrenceDisabled] = useState(true);
	const [isDateDisabled, setIsDateDisabled] = useState(true);
	const [inputValue, setInputValue] = useState({ count: { num: '1' } });
	const date = useMemo(() => new Date(start), [start]);

	const [datePickerValue, setDatePickerValue] = useState({
		until: {
			d: `${date.getFullYear()}${`0${date.getMonth() + 1}`.slice(-2)}${`0${date.getDate()}`.slice(
				-2
			)}`
		}
	});

	const onFirstRadioClick = useCallback(() => {
		setIsDateDisabled(true);
		setIsOccurrenceDisabled(true);
		setCustomEndValue(null);
	}, [setCustomEndValue]);

	const onSecondRadioClick = useCallback(() => {
		setIsDateDisabled(true);
		setIsOccurrenceDisabled(false);
		setCustomEndValue(inputValue);
	}, [inputValue, setCustomEndValue]);

	const onThirdRadioClick = useCallback(() => {
		setIsDateDisabled(false);
		setIsOccurrenceDisabled(true);
		setCustomEndValue(datePickerValue);
	}, [datePickerValue, setCustomEndValue]);

	const onEndDateChange = useCallback(
		(d) => {
			const fullData = `${d.getFullYear()}${`0${d.getMonth() + 1}`.slice(
				-2
			)}${`0${d.getDate()}`.slice(-2)}`;
			setCustomEndValue({ until: { d: fullData } });
			setDatePickerValue({ until: { d: fullData } });
		},
		[setCustomEndValue]
	);

	const inputHandler = useCallback(
		(ev) => {
			setCustomEndValue({
				count: {
					num: Number(ev.target.value)
				}
			});

			setInputValue({
				count: {
					num: Number(ev.target.value)
				}
			});
		},
		[setCustomEndValue]
	);

	return (
		<>
			<Padding vertical="medium">
				<Text weight="bold" size="large">
					{t('label.end', 'End')}
				</Text>
			</Padding>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input
					type="radio"
					name="endDate"
					onClick={onFirstRadioClick}
					defaultChecked={customEndValue === null}
				/>
				<Padding horizontal="small">
					<Text>{t('label.no_end_date', 'No end date')}</Text>
				</Padding>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input type="radio" name="endDate" onClick={onSecondRadioClick} />
				<Padding horizontal="small">
					<Text>{t('label.end_after', 'End after')}</Text>
				</Padding>
				<Padding horizontal="small" />
				<Input
					label={t('label.occurrences', 'Occurence(s)')}
					onChange={inputHandler}
					defaultValue={`${inputValue.count.num}`}
					disabled={isOccurrenceDisabled}
					width="fit"
					backgroundColor="gray5"
					hasError={
						customEndValue?.count?.num > 99 ||
						customEndValue?.count?.num < 1 ||
						(customEndValue?.count?.num && isNaN(Number(customEndValue?.count?.num)))
					}
				/>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input type="radio" name="endDate" onClick={onThirdRadioClick} />
				<Padding horizontal="small">
					<Text>{t('label.end_after', 'End after')}</Text>
				</Padding>
				<Styler orientation="horizontal" allDay height="fit" mainAlignment="space-between">
					<Container padding={{ all: 'small' }}>
						<SimplifiedCustomDatePicker
							start={start}
							allDay={allDay}
							disabled={isDateDisabled}
							onChange={onEndDateChange}
							backgroundColor="gray5"
						/>
					</Container>
				</Styler>
			</Container>
		</>
	);
};
