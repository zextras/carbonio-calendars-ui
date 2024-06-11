/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings } from '@zextras/carbonio-shell-ui';

export const parseDateFromICS = (icsString: string): Date => {
	const strYear = parseInt(icsString.substring(0, 4), 10);
	const strMonth = parseInt(icsString.substring(4, 6), 10) - 1;
	const strDay = parseInt(icsString.substring(6, 8), 10);
	if (icsString.length > 8) {
		const strHour = parseInt(icsString.substring(9, 11), 10);
		const strMin = parseInt(icsString.substring(11, 13), 10);
		const strSec = parseInt(icsString.substring(13, 15), 10);
		return new Date(strYear, strMonth, strDay, strHour, strMin, strSec);
	}

	return new Date(strYear, strMonth, strDay);
};

const dateTimeFormat = ({
	locale,
	timezone,
	allDay,
	intlOptions
}: {
	locale?: string;
	timezone?: string;
	allDay: boolean;
	intlOptions?: Partial<Intl.DateTimeFormatOptions>;
}): Intl.DateTimeFormat => {
	const localToApply =
		locale ??
		getUserSettings().prefs.zimbraPrefLocale ??
		Intl.NumberFormat().resolvedOptions().locale;

	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const timezoneToApply = timezone ?? localTimezone;

	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: allDay ? undefined : 'numeric',
		minute: allDay ? undefined : 'numeric',
		timeZone: timezoneToApply,
		timeZoneName: allDay ? undefined : 'short',
		...intlOptions
	} as const;

	return new Intl.DateTimeFormat(localToApply, options);
};

export const formatAppointmentRange = ({
	start,
	end,
	locale,
	allDay,
	allDayLabel,
	timezone,
	intlOptions
}: {
	start: number;
	end: number;
	locale?: string;
	allDay: boolean;
	allDayLabel: string;
	timezone?: string;
	intlOptions?: Partial<Intl.DateTimeFormatOptions>;
}): string => {
	const formattedRange = dateTimeFormat({ locale, timezone, allDay, intlOptions }).formatRange(
		start,
		end
	);
	return allDay ? `${formattedRange} - ${allDayLabel}` : formattedRange;
};
