/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { RECURRENCE_FREQUENCY } from '../constants/recurrence';

type UseRecurrenceItems = {
	months: Array<{ label: string; value: string }>;
	ordinalNumbers: Array<{ label: string; value: string }>;
	weekDays: Array<{ label: string; value: string }>;
	weekOptions: Array<{ label: string; value: string }>;
	repetitionItems: Array<{ label: string; value: string }>;
};
export const useRecurrenceItems = (): UseRecurrenceItems => {
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

	const weekDays = useMemo(
		() => [
			{ label: t('label.week_day.monday', 'Monday'), value: 'MO' },
			{ label: t('label.week_day.tuesday', 'Tuesday'), value: 'TU' },
			{ label: t('label.week_day.wednesday', 'Wednesday'), value: 'WE' },
			{ label: t('label.week_day.thursday', 'Thursday'), value: 'TH' },
			{ label: t('label.week_day.friday', 'Friday'), value: 'FR' },
			{ label: t('label.week_day.saturday', 'Saturday'), value: 'SA' },
			{ label: t('label.week_day.sunday', 'Sunday'), value: 'SU' }
		],
		[t]
	);

	const weekOptions = useMemo(
		() => [
			{ label: t('label.day', 'Day'), value: 'MO,TU,WE,TH,FR,SA,SU' },
			{ label: t('items.weekend_day', 'Weekend day'), value: 'SA,SU' },
			{ label: t('items.working_day', 'Working day'), value: 'MO,TU,WE,TH,FR' },
			...weekDays
		],
		[t, weekDays]
	);

	const repetitionItems = useMemo(
		() => [
			{ label: t('repeat.daily', 'Daily'), value: RECURRENCE_FREQUENCY.DAILY },
			{ label: t('repeat.weekly', 'Weekly'), value: RECURRENCE_FREQUENCY.WEEKLY },
			{ label: t('repeat.monthly', 'Monthly'), value: RECURRENCE_FREQUENCY.MONTHLY },
			{ label: t('repeat.yearly', 'Yearly'), value: RECURRENCE_FREQUENCY.YEARLY }
		],
		[t]
	);

	return {
		months,
		ordinalNumbers,
		weekDays,
		weekOptions,
		repetitionItems
	};
};
