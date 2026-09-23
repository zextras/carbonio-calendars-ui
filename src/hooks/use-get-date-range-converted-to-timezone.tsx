/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { compact, toLower } from 'lodash';
import { useTranslation } from 'react-i18next';

import { getDateFnsLocale } from '../commons/date-fns-react-widgets-localizer';

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

const formatMultiDayRange = ({
	start,
	end,
	locale,
	timeZone
}: {
	start: number | Date;
	end: number | Date;
	locale: string;
	timeZone?: string;
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
		timeZone
	});

	return `${dateFormat.format(start)}, ${timeFormat.format(start)} \u2013 ${dateFormat.format(
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
	const { timeZone } = options;
	if (options?.allDay || isSameDay({ start, end, locale, timeZone })) {
		return new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			month: 'long',
			day: '2-digit',
			year: 'numeric',
			minute: options?.allDay ? undefined : '2-digit',
			timeZone,
			second: undefined,
			hour: options?.allDay ? undefined : '2-digit'
		} as const).formatRange(start, end);
	}
	return formatMultiDayRange({ start, end, locale, timeZone });
};

export const getTimeStrings = ({ start, end, options }: TimeStringsType): string => {
	const gmtOptions = {
		timeZone: options?.timeZone,
		timeZoneName: 'longOffset'
	} as const;

	const locale = options.locale ?? getDateFnsLocale()?.code ?? navigator.language;
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
	const userSetting = useUserSettings().prefs.zimbraPrefLocale;
	const locale = useMemo(() => userSetting ?? navigator.language, [userSetting]);

	return useMemo(
		() => getTimeStrings({ start, end, options: { allDay, allDayLabel, locale, timeZone } }),
		[allDay, allDayLabel, end, locale, start, timeZone]
	);
};
