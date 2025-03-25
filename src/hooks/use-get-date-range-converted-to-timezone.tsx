/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { toLower } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

export const getTimeString = (
	_start: number | undefined,
	_end: number | undefined,
	allDay: boolean | undefined,
	allDayLabel: string
): string => {
	const startEvent = moment(_start);
	const endEvent = moment(_end);
	const dayFormat = 'dddd, DD MMMM, YYYY';
	const timeFormat = 'HH:mm';
	const completeFormat = `${dayFormat} ${timeFormat}`;
	const diff = endEvent.diff(startEvent, 'days');
	const allDayString =
		diff > 0
			? `${startEvent.format(dayFormat)} -
	           ${endEvent.format(dayFormat)} - ${allDayLabel}`
			: `${startEvent.format(dayFormat)} - ${allDayLabel}`;

	const notAllDayString =
		diff > 0
			? `${startEvent.format(completeFormat)} - ${endEvent.format(completeFormat)}`
			: `${startEvent.format(completeFormat)} - ${endEvent.format(timeFormat)}`;

	return allDay ? allDayString : notAllDayString;
};

type EventTimeOptions = {
	allDay?: boolean;
	timeZone?: string;
};

export const useGetRangeDateConvertedToTimezone = (
	start: number,
	end: number,
	options: EventTimeOptions | undefined = {}
): string => {
	const { allDay = false, timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone } =
		options;
	const [t] = useTranslation();
	const allDayLabel = useMemo(() => (allDay ? t('label.all_day', 'All day') : ''), [allDay, t]);
	const locale = useUserSettings().prefs.zimbraPrefLocale ?? navigator.language ?? 'en-US';

	const formatOptions = useMemo(
		() =>
			({
				weekday: 'long',
				month: 'long',
				day: '2-digit',
				year: 'numeric',
				minute: '2-digit',
				timeZoneName: 'longOffset',
				hour: allDay ? undefined : '2-digit'
			}) as const,
		[allDay]
	);

	return useMemo(() => {
		const dateTimeFormat = new Intl.DateTimeFormat(locale, {
			...formatOptions,
			timeZone
		});

		const formattedRange = dateTimeFormat.formatRange(start, end);
		return allDay ? `${formattedRange}, ${toLower(allDayLabel)}` : formattedRange;
	}, [allDay, allDayLabel, end, formatOptions, locale, start, timeZone]);
};
