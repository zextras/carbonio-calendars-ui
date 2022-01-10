/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useCallback, useState } from 'react';
import { Container, Padding, Text } from '@zextras/zapp-ui';
import {
	IntervalInput,
	MonthlyDayInput,
	OrdinalNumberSelector,
	WeekDaySelector
} from './options-components';

const FirstRadioOption = ({
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled,
	setIs1stOptDisabled
}) => {
	const [t] = useTranslation();
	const [bymonthday, setByMonthDay] = useState(customRepeatValue?.bymonthday);
	const [interval, setInterval] = useState(customRepeatValue?.interval);

	const onRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			bymonthday,
			interval,
			bysetpos: undefined,
			byday: undefined
		});
		setIs1stOptDisabled(false);
	}, [customRepeatValue, bymonthday, interval, setCustomRepeatValue, setIs1stOptDisabled]);

	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="center"
			padding={{ vertical: 'small' }}
			width="100%"
		>
			<input type="radio" name="frequency" onClick={onRadioClick} defaultChecked />
			<Padding horizontal="small">
				<Text>{t('label.day', 'Day')}</Text>
			</Padding>
			<MonthlyDayInput
				customRepeatValue={customRepeatValue}
				setCustomRepeatValue={setCustomRepeatValue}
				bymonthday={bymonthday}
				setByMonthDay={setByMonthDay}
				is1stOptDisabled={is1stOptDisabled}
			/>
			<Padding horizontal="small">
				<Text>{t('label.of_every', 'of every')}</Text>
			</Padding>
			<IntervalInput
				label={t('label.month', 'Month')}
				interval={interval}
				setInterval={setInterval}
				customRepeatValue={customRepeatValue}
				setCustomRepeatValue={setCustomRepeatValue}
				is1stOptDisabled={is1stOptDisabled}
			/>
			<Padding horizontal="small">
				<Text>{t('label.months', 'Months')}</Text>
			</Padding>
		</Container>
	);
};

const SecondRadioOption = ({
	slicedWeekDay,
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled,
	setIs1stOptDisabled
}) => {
	const [t] = useTranslation();
	const [bysetpos, setBySetPos] = useState({ poslist: '1' });
	const [byday, setByDay] = useState({ wkday: [{ day: slicedWeekDay }] });
	const [interval, setInterval] = useState(customRepeatValue?.interval);

	const onRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			bysetpos,
			byday,
			interval,
			bymonthday: undefined
		});
		setIs1stOptDisabled(true);
	}, [byday, bysetpos, customRepeatValue, interval, setCustomRepeatValue, setIs1stOptDisabled]);

	return (
		<Container
			orientation="vertical"
			mainAlignment="center"
			crossAlignment="flex-start"
			width="100%"
		>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				width="fill"
			>
				<input type="radio" id="week" name="frequency" onClick={onRadioClick} />
				<Padding horizontal="small">
					<Text>{t('label.the', 'The')}</Text>
				</Padding>
				<OrdinalNumberSelector
					setBySetPos={setBySetPos}
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={!is1stOptDisabled}
				/>
				<Padding horizontal="small" />
				<WeekDaySelector
					byday={byday}
					setByDay={setByDay}
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={!is1stOptDisabled}
				/>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
				width="80%"
			>
				<Padding horizontal="small">
					<Text>{t('label.of_every_month', 'of the month, every')}</Text>
				</Padding>
				<IntervalInput
					label={t('label.month', 'Month')}
					interval={interval}
					setInterval={setInterval}
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={!is1stOptDisabled}
				/>
				<Padding horizontal="small">
					<Text>{t('label.months', 'Months')}</Text>
				</Padding>
			</Container>
		</Container>
	);
};

export const MonthlyCustomRecurrence = ({
	customRepeatValue,
	setCustomRepeatValue,
	slicedWeekDay
}) => {
	const [is1stOptDisabled, setIs1stOptDisabled] = useState(false);

	return (
		<>
			<FirstRadioOption
				customRepeatValue={customRepeatValue}
				setCustomRepeatValue={setCustomRepeatValue}
				is1stOptDisabled={is1stOptDisabled}
				setIs1stOptDisabled={setIs1stOptDisabled}
			/>
			<SecondRadioOption
				slicedWeekDay={slicedWeekDay}
				customRepeatValue={customRepeatValue}
				setCustomRepeatValue={setCustomRepeatValue}
				is1stOptDisabled={is1stOptDisabled}
				setIs1stOptDisabled={setIs1stOptDisabled}
			/>
		</>
	);
};
