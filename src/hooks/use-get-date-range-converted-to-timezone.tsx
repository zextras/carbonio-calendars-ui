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
	// RFC 5545 only requires a VTIMEZONE's TZID to be unique within the
	// calendar object — it does not have to be an IANA identifier. Outlook/
	// Exchange invites commonly carry Windows zone names instead (e.g.
	// "W. Europe Standard Time"), which `Intl.DateTimeFormat` rejects with a
	// RangeError. Fall back to the local zone instead of crashing the render.
	let timeZone = options?.timeZone;
	if (timeZone) {
		try {
			Intl.DateTimeFormat(undefined, { timeZone });
		} catch {
			timeZone = undefined;
		}
	}

	const rangeOptions = {
		weekday: 'long',
		month: 'long',
		day: '2-digit',
		year: 'numeric',
		minute: options?.allDay ? undefined : '2-digit',
		timeZone,
		second: undefined,
		hour: options?.allDay ? undefined : '2-digit'
	} as const;

	const gmtOptions = {
		timeZone,
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

	const timezoneString = options?.allDay ? undefined : timeZone;

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
