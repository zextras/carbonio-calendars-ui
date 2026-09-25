/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { compact, toLower } from 'lodash';
import { useTranslation } from 'react-i18next';

import { TIME_FORMAT_PREF_NAME, toHour12Option } from '../commons/time-format';
import { getLocale, localeFromPrefs } from './use-locale';

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
		hour12?: boolean;
	};
};

const formatMultiDayRange = ({
	start,
	end,
	locale,
	timeZone,
	hour12
}: {
	start: number | Date;
	end: number | Date;
	locale: string;
	timeZone?: string;
	hour12?: boolean;
}): string => {
	const dateFormat = new Intl.DateTimeFormat(locale, {
		weekday: 'long',
		month: 'long',
		day: '2-digit',
		year: 'numeric',
		timeZone
	});
	const isTwelveHourLocale = new Intl.DateTimeFormat(locale, { hour: 'numeric', timeZone })
		.formatToParts(start)
		.some((part) => part.type === 'dayPeriod');
	const timeFormat = new Intl.DateTimeFormat(locale, {
		hour: isTwelveHourLocale ? 'numeric' : '2-digit',
		minute: '2-digit',
		timeZone,
		hour12
	});

	return `${dateFormat.format(start)}, ${timeFormat.format(start)} – ${dateFormat.format(
		end
	)}, ${timeFormat.format(end)}`;
};

const isSameDay = ({
	start,
	end,
	locale,
	timeZone
}: {
	start: number | Date;
	end: number | Date;
	locale: string;
	timeZone?: string;
}): boolean => {
	const dayFormat = new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone
	});
	return dayFormat.format(start) === dayFormat.format(end);
};

const formatRange = ({
	start,
	end,
	locale,
	options
}: {
	start: number | Date;
	end: number | Date;
	locale: string;
	options: TimeStringsType['options'];
}): string => {
	const { timeZone, hour12 } = options;
	if (options?.allDay || isSameDay({ start, end, locale, timeZone })) {
		return new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			month: 'long',
			day: '2-digit',
			year: 'numeric',
			minute: options?.allDay ? undefined : '2-digit',
			timeZone,
			second: undefined,
			hour: options?.allDay ? undefined : '2-digit',
			hour12: options?.allDay ? undefined : hour12
		} as const).formatRange(start, end);
	}
	return formatMultiDayRange({
		start,
		end,
		locale,
		timeZone,
		hour12: options?.allDay ? undefined : hour12
	});
};

export const getTimeStrings = ({ start, end, options }: TimeStringsType): string => {
	const gmtOptions = {
		timeZone: options?.timeZone,
		timeZoneName: 'longOffset'
	} as const;

	const locale = options.locale ?? getLocale();
	const dateGmtTimeFormat = new Intl.DateTimeFormat(locale, gmtOptions);

	const formattedRange = formatRange({ start, end, locale, options });
	const formatParts = dateGmtTimeFormat.formatToParts(start);

	const timezoneGmt = formatParts.find((part) => part.type === 'timeZoneName')?.value;

	const timezoneString = options?.allDay ? undefined : options?.timeZone;

	const allDayLabel = options?.allDay ? options?.allDayLabel : undefined;

	return compact([formattedRange, timezoneGmt, timezoneString, allDayLabel]).join(' ');
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
	const { prefs } = useUserSettings();
	const locale = useMemo(() => localeFromPrefs(prefs), [prefs]);
	const hour12 = useMemo(() => toHour12Option(prefs[TIME_FORMAT_PREF_NAME]), [prefs]);

	return useMemo(
		() =>
			getTimeStrings({ start, end, options: { allDay, allDayLabel, locale, timeZone, hour12 } }),
		[allDay, allDayLabel, end, hour12, locale, start, timeZone]
	);
};
