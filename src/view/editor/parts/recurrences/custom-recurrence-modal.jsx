/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';
import { Container, CustomModal, Padding, Select, Text } from '@zextras/carbonio-design-system';
import moment from 'moment';
import { pickBy, identity, toUpper, isNaN } from 'lodash';
import { useSelector } from 'react-redux';
import { t } from '@zextras/carbonio-shell-ui';
import { DailyCustomRecurrence } from './daily-custom-recurrence';
import { YearlyCustomRecurrence } from './yearly-custom-recurrence';
import { MonthlyCustomRecurrence } from './monthly-custom-recurrence';
import { SetCustomEnd } from './set-custom-end';
import { WeeklyCustomRecurrence } from './weekly-custom-recurrence';
import { ModalHeader } from '../../../../commons/modal-header';
import ModalFooter from '../../../../commons/modal-footer';
import { selectStart } from '../../../../store/selectors/calendars';

const RepetitionFrequency = {
	DAILY: 'DAI',
	WEEKLY: 'WEE',
	MONTHLY: 'MON',
	YEARLY: 'YEA'
};

export default function CustomRecurrenceModal({ openModal, setOpenCb, onRecurrenceChange }) {
	const start = useSelector(selectStart);

	const defaultRepetition = useMemo(
		() => ({
			freq: RepetitionFrequency.DAILY,
			interval: { ival: 1 }
		}),
		[]
	);
	const [customRepeatValue, setCustomRepeatValue] = useState(defaultRepetition);
	const [customEndValue, setCustomEndValue] = useState(null);
	const defaultWeekDay = useMemo(() => moment(start).format('dddd'), [start]);
	const slicedWeekDay = useMemo(() => toUpper(`${defaultWeekDay.slice(0, 2)}`), [defaultWeekDay]);
	const bymonth = useMemo(() => ({ molist: parseInt(moment(start).format('MM'), 10) }), [start]);
	const bymonthday = useMemo(() => ({ modaylist: moment(start).format('D') }), [start]);

	const repetitionItems = useMemo(
		() => [
			{ label: t('repeat.daily', 'Daily'), value: RepetitionFrequency.DAILY },
			{ label: t('repeat.weekly', 'Weekly'), value: RepetitionFrequency.WEEKLY },
			{ label: t('repeat.monthly', 'Monthly'), value: RepetitionFrequency.MONTHLY },
			{ label: t('repeat.yearly', 'Yearly'), value: RepetitionFrequency.YEARLY }
		],
		[]
	);

	const onRepetitionChange = useCallback(
		(ev) => {
			const defaultValue = { freq: ev, interval: { ival: 1 } };
			switch (ev) {
				case RepetitionFrequency.DAILY:
					setCustomRepeatValue(defaultValue);
					break;
				case RepetitionFrequency.WEEKLY:
					setCustomRepeatValue({ ...defaultValue, byday: { wkday: [{ day: slicedWeekDay }] } });
					break;
				case RepetitionFrequency.MONTHLY:
					setCustomRepeatValue({ ...defaultValue, bymonthday });
					break;
				case RepetitionFrequency.YEARLY:
					setCustomRepeatValue({ ...defaultValue, bymonthday, bymonth });
					break;
				default:
					console.warn('operation not handled!');
			}
		},
		[bymonth, bymonthday, slicedWeekDay]
	);

	const onClose = useCallback(() => {
		setOpenCb(false);
		setCustomRepeatValue(defaultRepetition);
	}, [defaultRepetition, setOpenCb]);

	const onConfirm = useCallback(() => {
		onRecurrenceChange({
			add: { rule: pickBy({ ...customRepeatValue, ...customEndValue }, identity) }
		});
		setOpenCb(false);
		setCustomRepeatValue(undefined);
	}, [onRecurrenceChange, customEndValue, customRepeatValue, setOpenCb]);

	return (
		<CustomModal open={openModal} maxHeight="100%" onClose={onClose}>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader title={t('label.custom_repeat', 'Custom Repeat')} onClose={onClose} />
				<Padding vertical="medium">
					<Text weight="bold" size="large">
						{t('label.repeat', 'Repeat')}
					</Text>
				</Padding>
				<Select
					label={t('label.repeat', 'Repeat')}
					onChange={onRepetitionChange}
					items={repetitionItems}
					selection={repetitionItems[0]}
					disablePortal
				/>
				{(customRepeatValue?.freq === RepetitionFrequency.DAILY && (
					<DailyCustomRecurrence
						customRepeatValue={customRepeatValue}
						setCustomRepeatValue={setCustomRepeatValue}
					/>
				)) ||
					(customRepeatValue?.freq === RepetitionFrequency.WEEKLY && (
						<WeeklyCustomRecurrence
							customRepeatValue={customRepeatValue}
							setCustomRepeatValue={setCustomRepeatValue}
							slicedWeekDay={slicedWeekDay}
						/>
					)) ||
					(customRepeatValue?.freq === RepetitionFrequency.MONTHLY && (
						<MonthlyCustomRecurrence
							customRepeatValue={customRepeatValue}
							setCustomRepeatValue={setCustomRepeatValue}
							slicedWeekDay={slicedWeekDay}
						/>
					)) ||
					(customRepeatValue?.freq === RepetitionFrequency.YEARLY && (
						<YearlyCustomRecurrence
							customRepeatValue={customRepeatValue}
							setCustomRepeatValue={setCustomRepeatValue}
							slicedWeekDay={slicedWeekDay}
						/>
					))}
				<SetCustomEnd
					customEndValue={customEndValue}
					setCustomEndValue={setCustomEndValue}
					onRecurrenceChange={onRecurrenceChange}
				/>
				<ModalFooter
					onConfirm={onConfirm}
					label={t('repeat.customize', 'Customize')}
					backgroundColor="primary"
					disabled={
						customRepeatValue?.freq === undefined ||
						isNaN(customEndValue?.count?.num) ||
						isNaN(customRepeatValue?.interval?.ival) ||
						customRepeatValue?.interval.ival > 99 ||
						customRepeatValue?.interval.ival < 1 ||
						customEndValue === undefined ||
						customEndValue?.count?.num > 99 ||
						customEndValue?.count?.num < 1 ||
						customEndValue?.bymonthday?.num < 1 ||
						Number(customRepeatValue?.bymonthday?.modaylist) > 31 ||
						Number(customRepeatValue?.bymonthday?.modaylist) < 1
					}
				/>
			</Container>
		</CustomModal>
	);
}
