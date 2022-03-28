/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useCallback, useMemo } from 'react';
import { differenceWith, find, isEqual, isNaN, map } from 'lodash';
import { Checkbox, Container, Input, Select } from '@zextras/carbonio-design-system';

export const MonthSelector = ({
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled,
	bymonth,
	setByMonth
}) => {
	const [t] = useTranslation();

	const months = useMemo(
		() => [
			{ label: t('months.january', 'January'), value: '1' },
			{ label: t('months.february', 'February'), value: '2' },
			{ label: t('months.march', 'March'), value: '3' },
			{ label: t('months.april', 'April'), value: '4' },
			{ label: t('months.may', 'May'), value: '5' },
			{ label: t('months.june', 'June'), value: '6' },
			{ label: t('months.july', 'July'), value: '7' },
			{ label: t('months.august', 'August'), value: '8' },
			{ label: t('months.september', 'September'), value: '9' },
			{ label: t('months.october', 'October'), value: '10' },
			{ label: t('months.november', 'November'), value: '11' },
			{ label: t('months.december', 'December'), value: '12' }
		],
		[t]
	);

	const defaultMonthSelection = useMemo(
		() => find(months, (mon) => Number(mon.value) === bymonth?.molist),
		[bymonth?.molist, months]
	);

	const onMonthChange = useCallback(
		(ev) => {
			const molist = Number(ev);
			setByMonth({ bymonth: { molist } });
			setCustomRepeatValue({ ...customRepeatValue, bymonth: { molist } });
		},
		[customRepeatValue, setByMonth, setCustomRepeatValue]
	);
	return (
		<Select
			items={months}
			label={t('label.month', 'Month')}
			onChange={onMonthChange}
			disablePortal
			width="fit"
			disabled={is1stOptDisabled}
			defaultSelection={defaultMonthSelection}
		/>
	);
};

export const MonthlyDayInput = ({
	bymonthday,
	setByMonthDay,
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled
}) => {
	const [t] = useTranslation();

	const onDayChange = useCallback(
		(ev) => {
			setByMonthDay({ modaylist: ev.target.value });
			setCustomRepeatValue({ ...customRepeatValue, bymonthday: { modaylist: ev.target.value } });
		},
		[customRepeatValue, setByMonthDay, setCustomRepeatValue]
	);
	return (
		<Input
			label={t('label.day', 'Day')}
			onChange={onDayChange}
			hasError={
				Number(bymonthday?.modaylist) > 31 ||
				Number(bymonthday?.modaylist) < 1 ||
				(bymonthday?.modaylist && isNaN(Number(bymonthday?.modaylist)))
			}
			width="fit"
			backgroundColor="gray5"
			disabled={is1stOptDisabled}
			defaultValue={bymonthday?.modaylist}
		/>
	);
};

export const OrdinalNumberSelector = ({
	setBySetPos,
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled
}) => {
	const [t] = useTranslation();

	const ordinalNumbers = useMemo(
		() => [
			{ label: t('items.first', 'First'), value: '1' },
			{ label: t('items.second', 'Second'), value: '2' },
			{ label: t('items.third', 'Third'), value: '3' },
			{ label: t('items.fourth', 'Fourth'), value: '4' },
			{ label: t('items.last', 'Last'), value: '-1' }
		],
		[t]
	);
	const onBySetPosChange = useCallback(
		(ev) => {
			setBySetPos({ poslist: ev });
			setCustomRepeatValue({ ...customRepeatValue, bysetpos: { poslist: ev } });
		},
		[customRepeatValue, setBySetPos, setCustomRepeatValue]
	);
	return (
		<Select
			items={ordinalNumbers}
			label={t('label.number', 'Number')}
			onChange={onBySetPosChange}
			disablePortal
			width="fit"
			disabled={is1stOptDisabled}
			defaultSelection={ordinalNumbers[0]}
		/>
	);
};

export const WeekDaySelector = ({
	byday,
	setByDay,
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled
}) => {
	const [t] = useTranslation();

	const weekOptions = useMemo(
		() => [
			{ label: t('label.day', 'Day'), value: 'MO,TU,WE,TH,FR,SA,SU' },
			{ label: t('items.weekend_day', 'Weekend day'), value: 'SA,SU' },
			{ label: t('items.working_day', 'Working day'), value: 'MO,TU,WE,TH,FR' },
			{ label: t('label.week.monday', 'Monday'), value: 'MO' },
			{ label: t('label.week.tuesday', 'Tuesday'), value: 'TU' },
			{ label: t('label.week.wednesday', 'Wednesday'), value: 'WE' },
			{ label: t('label.week.thursday', 'Thursday'), value: 'TH' },
			{ label: t('label.week.friday', 'Friday'), value: 'FR' },
			{ label: t('label.week.saturday', 'Saturday'), value: 'SA' },
			{ label: t('label.week.sunday', 'Sunday'), value: 'SU' }
		],
		[t]
	);

	const defaultDaySelection = useMemo(
		() =>
			find(
				weekOptions,
				(item) =>
					differenceWith(
						map(item.value.split(','), (day) => ({ day })),
						byday?.wkday,
						isEqual
					).length === 0
			),
		[byday?.wkday, weekOptions]
	);

	const onByDayChange = useCallback(
		(ev) => {
			const days = map(ev.split(','), (day) => ({ day }));
			setByDay(days);
			setCustomRepeatValue({ ...customRepeatValue, byday: { wkday: days } });
		},
		[customRepeatValue, setByDay, setCustomRepeatValue]
	);
	return (
		<Select
			items={weekOptions}
			label={t('label.day', 'Day')}
			onChange={onByDayChange}
			disablePortal
			width="fit"
			disabled={is1stOptDisabled}
			defaultSelection={defaultDaySelection}
		/>
	);
};

export const IntervalInput = ({
	label,
	interval,
	setInterval,
	customRepeatValue,
	setCustomRepeatValue,
	is1stOptDisabled
}) => {
	const onIntervalChange = useCallback(
		(ev) => {
			setInterval({ ival: ev.target.value });
			setCustomRepeatValue({ ...customRepeatValue, interval: { ival: ev.target.value } });
		},
		[customRepeatValue, setCustomRepeatValue, setInterval]
	);
	return (
		<Input
			label={label}
			onChange={onIntervalChange}
			disablePortal
			backgroundColor="gray5"
			disabled={is1stOptDisabled}
			defaultValue={`${interval.ival}`}
			hasError={interval.ival > 99 || interval.ival < 1 || isNaN(Number(interval.ival))}
		/>
	);
};

export const WeekdayCheckboxes = ({ customRepeatValue, setCustomRepeatValue, byday, setByDay }) => {
	const [t] = useTranslation();

	const selectItems = useMemo(
		() => [
			{ label: t('label.week.monday', 'Monday'), value: 'MO' },
			{ label: t('label.week.tuesday', 'Tuesday'), value: 'TU' },
			{ label: t('label.week.wednesday', 'Wednesday'), value: 'WE' },
			{ label: t('label.week.thursday', 'Thursday'), value: 'TH' },
			{ label: t('label.week.friday', 'Friday'), value: 'FR' },
			{ label: t('label.week.saturday', 'Saturday'), value: 'SA' },
			{ label: t('label.week.sunday', 'Sunday'), value: 'SU' }
		],
		[t]
	);

	const handleMultipleCheckboxes = useCallback(
		(val) => {
			const findEl = find(customRepeatValue.byday.wkday, (item) => item.day === val.value);
			const day = { day: val.value };

			if (!findEl) {
				setByDay([...customRepeatValue.byday.wkday, day]);
				setCustomRepeatValue({
					...customRepeatValue,
					byday: {
						wkday: [...customRepeatValue.byday.wkday, day]
					}
				});
			} else {
				setByDay(differenceWith(customRepeatValue.byday.wkday, [day], isEqual));
				setCustomRepeatValue({
					...customRepeatValue,
					byday: {
						wkday: differenceWith(customRepeatValue.byday.wkday, [day], isEqual)
					}
				});
			}
		},
		[customRepeatValue, setByDay, setCustomRepeatValue]
	);
	return map(selectItems, (s, index) => (
		<Container
			key={`week_day_${index}`}
			orientation="horizontal"
			width="fit"
			mainAlignment="flex-start"
			padding={{ horizontal: 'small' }}
		>
			<Checkbox
				onClick={() => handleMultipleCheckboxes(s)}
				label={s.label.slice(0, 3)}
				iconSize="medium"
				defaultChecked={!!find(byday.wkday, (item) => item.day === s.value)}
			/>
		</Container>
	));
};
