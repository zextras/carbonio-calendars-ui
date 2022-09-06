/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';
import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	MonthlyDayInput,
	MonthSelector,
	OrdinalNumberSelector,
	WeekDaySelector
} from './options-components';

const FirstRadioOption = ({
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled,
	setIs1stOptDisabled
}) => {
	const [bymonthday, setByMonthDay] = useState(customRepeatValue?.bymonthday);
	const [bymonth, setByMonth] = useState(customRepeatValue?.bymonth);

	const onRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			bymonthday,
			bymonth,
			bysetpos: undefined,
			byday: undefined
		});
		setIs1stOptDisabled(false);
	}, [setCustomRepeatValue, customRepeatValue, bymonthday, bymonth, setIs1stOptDisabled]);

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
				<Text>{t('label.every_year_on', 'Every year on')}</Text>
			</Padding>
			<MonthlyDayInput
				customRepeatValue={customRepeatValue}
				setCustomRepeatValue={setCustomRepeatValue}
				bymonthday={bymonthday}
				setByMonthDay={setByMonthDay}
				is1stOptDisabled={is1stOptDisabled}
			/>
			<Padding horizontal="small">
				<Text>{t('label.of', 'of')}</Text>
			</Padding>
			<MonthSelector
				customRepeatValue={customRepeatValue}
				setCustomRepeatValue={setCustomRepeatValue}
				is1stOptDisabled={is1stOptDisabled}
				bymonth={bymonth}
				setByMonth={setByMonth}
			/>
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
	const [bysetpos, setBySetPos] = useState({ poslist: '1' });
	const [byday, setByDay] = useState({ wkday: [{ day: slicedWeekDay }] });
	const [bymonth, setByMonth] = useState(customRepeatValue?.bymonth);

	const onRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			bysetpos,
			byday,
			bymonth,
			bymonthday: undefined
		});
		setIs1stOptDisabled(true);
	}, [byday, bysetpos, customRepeatValue, bymonth, setCustomRepeatValue, setIs1stOptDisabled]);

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
					<Text>{t('label.of', 'of')}</Text>
				</Padding>
				<MonthSelector
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={!is1stOptDisabled}
					bymonth={bymonth}
					setByMonth={setByMonth}
				/>
			</Container>
		</Container>
	);
};

export const YearlyCustomRecurrence = ({
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
