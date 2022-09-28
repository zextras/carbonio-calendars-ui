/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useCallback } from 'react';
import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { IntervalInput } from './options-components';

export const DailyCustomRecurrence = ({ customRepeatValue, setCustomRepeatValue }) => {
	const [isInputDisabled, setIsInputDisabled] = useState(true);
	const [interval, setInterval] = useState(customRepeatValue?.interval);

	const onFirstRadioClick = useCallback(() => {
		setIsInputDisabled(true);
		setCustomRepeatValue({
			...customRepeatValue,
			interval: {
				ival: 1
			},
			byday: undefined
		});
	}, [customRepeatValue, setCustomRepeatValue]);

	const onSecondRadioClick = useCallback(() => {
		setIsInputDisabled(true);
		setCustomRepeatValue({
			...customRepeatValue,
			byday: {
				wkday: [{ day: 'MO' }, { day: 'TU' }, { day: 'WE' }, { day: 'TH' }, { day: 'FR' }]
			},
			interval: { ival: 1 }
		});
	}, [customRepeatValue, setCustomRepeatValue]);

	const onThirdRadioClick = useCallback(() => {
		setCustomRepeatValue({
			...customRepeatValue,
			freq: customRepeatValue.freq,
			interval,
			byday: undefined
		});
		setIsInputDisabled(false);
	}, [customRepeatValue, interval, setCustomRepeatValue]);

	return (
		<Padding vertical="small">
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input type="radio" name="frequency" onClick={onFirstRadioClick} defaultChecked />
				<Padding horizontal="small">
					<Text>{t('label.every_day', 'Every day')}</Text>
				</Padding>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input type="radio" name="frequency" onClick={onSecondRadioClick} />
				<Padding horizontal="small">
					<Text>{t('label.every_weekday', 'Every weekday')}</Text>
				</Padding>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ vertical: 'small' }}
			>
				<input type="radio" id="male" name="frequency" onClick={onThirdRadioClick} />
				<Padding horizontal="small">
					<Text>{t('label.every', 'Every')}</Text>
				</Padding>
				<IntervalInput
					label={t('label.days', 'Days')}
					interval={interval}
					setInterval={setInterval}
					customRepeatValue={customRepeatValue}
					setCustomRepeatValue={setCustomRepeatValue}
					is1stOptDisabled={isInputDisabled}
				/>
			</Container>
		</Padding>
	);
};
