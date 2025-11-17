/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { compact, toLower } from 'lodash';
import { useTranslation } from 'react-i18next';

type EventTimeOptions = {
	allDay?: boolean;
	timeZone?: string;
};

type TimeStringsType = {
	start: number | Date;
	end: number | Date;
	options: {
		timeZone?: string;
		allDay?: boolean;
		allDayLabel?: string;
		locale?: string;
	};
};

export const getTimeStrings = ({ start, end, options }: TimeStringsType): string => {
	const rangeOptions = {
		weekday: 'long',
		month: 'long',
		day: '2-digit',
		year: 'numeric',
		minute: options?.allDay ? undefined : '2-digit',
		timeZone: options?.timeZone,
		second: undefined,
		hour: options?.allDay ? undefined : '2-digit'
	} as const;

	const gmtOptions = {
		timeZone: options?.timeZone,
		timeZoneName: 'longOffset'
	} as const;

	const dateTimeFormat = new Intl.DateTimeFormat(
		options.locale ?? navigator.language,
		rangeOptions
	);
	const dateGmtTimeFormat = new Intl.DateTimeFormat(
		options.locale ?? navigator.language,
		gmtOptions
	);

	const formattedRange = dateTimeFormat.formatRange(start, end);
	const formatParts = dateGmtTimeFormat.formatToParts(start);

	const timezoneGmt = formatParts.find((part) => part.type === 'timeZoneName')?.value;

	const timezoneString = options?.allDay ? undefined : options?.timeZone;

	return compact([formattedRange, timezoneGmt, timezoneString, options?.allDayLabel]).join(' ');
};

export const useGetDateRangeConvertedToTimezone = (
	start: number | Date,
	end: number | Date,
	options: EventTimeOptions | undefined = {}
): string => {
	const { allDay = false, timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone } =
		options;
	const [t] = useTranslation();
	const allDayLabel = useMemo(
		() => (allDay ? toLower(t('label.all_day', 'All day')) : ''),
		[allDay, t]
	);
	const userSetting = useUserSettings().prefs.zimbraPrefLocale;
	const locale = useMemo(() => userSetting ?? navigator.language, [userSetting]);

	return useMemo(
		() => getTimeStrings({ start, end, options: { allDay, allDayLabel, locale, timeZone } }),
		[allDay, allDayLabel, end, locale, start, timeZone]
	);
};
