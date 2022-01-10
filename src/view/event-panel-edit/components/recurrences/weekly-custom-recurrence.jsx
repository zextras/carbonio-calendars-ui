/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useCallback, useState } from 'react';
import { Container, Padding, Text } from '@zextras/zapp-ui';
import { IntervalInput, WeekdayCheckboxes, WeekDaySelector } from './options-components';

export const WeeklyCustomRecurrence = ({
	customRepeatValue,
	setCustomRepeatValue,
	slicedWeekDay
}) => {
	const [t] = useTranslation();

	const [is1stOptSelected, setIs1stOptSelected] = useState(true);
	const [is2ndOptSelected, setIs2ndOptSelected] = useState(false);
	const [interval, setInterval] = useState(customRepeatValue.interval);
	const [byday, setByDay] = useState({ wkday: [{ day: slicedWeekDay }] });

	const onFirstRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			byday,
			interval
		});
		setIs1stOptSelected(true);
		setIs2ndOptSelected(false);
	}, [byday, customRepeatValue, interval, setCustomRepeatValue]);

	const onSecondRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			byday,
			interval
		});
		setIs1stOptSelected(false);
		setIs2ndOptSelected(true);
	}, [customRepeatValue, byday, interval, setCustomRepeatValue]);

	return (
		<>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input type="radio" name="frequency" onClick={onFirstRadioClick} defaultChecked />
				<Padding horizontal="small">
					<Text>{t('label.every', 'Every')}</Text>
				</Padding>
				<WeekDaySelector
					byday={byday}
					setByDay={setByDay}
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={!is1stOptSelected}
				/>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
				width="fill"
			>
				<input type="radio" name="frequency" onClick={onSecondRadioClick} />
				<Padding horizontal="small">
					<Text>{t('label.every', 'Every')}</Text>
				</Padding>
				<IntervalInput
					label={t('label.weeks_on', 'Weeks on')}
					interval={interval}
					setInterval={setInterval}
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={!is2ndOptSelected}
				/>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				{is2ndOptSelected && (
					<WeekdayCheckboxes
						byday={byday}
						setByDay={setByDay}
						customRepeatValue={customRepeatValue}
						setCustomRepeatValue={setCustomRepeatValue}
					/>
				)}
			</Container>
		</>
	);
};
