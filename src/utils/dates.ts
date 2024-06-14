/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings } from '@zextras/carbonio-shell-ui';
import { isNaN } from 'lodash';

export const getTimezoneOffsetFromUtc = (timeZone?: string, date?: Date): number => {
	if (!timeZone) return 0;

	const timeZoneName = Intl.DateTimeFormat('en', {
		timeZoneName: 'shortOffset',
		timeZone
	})
		.formatToParts(date)
		.find((i) => i.type === 'timeZoneName')?.value;
	if (!timeZoneName) return 0;
	const offset = timeZoneName.slice(3);
	if (!offset) return 0;

	const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
	if (matchData) {
		const [, sign, hour, minute] = matchData;
		let result = parseInt(hour, 10) * 60;
		if (minute) result += parseInt(minute, 10);
		if (sign === '+') result *= -1;

		return result;
	}
	return 0;
};

export const convertDateToLocal = (date: Date, timezone?: string): Date => {
	const utcOffset = getTimezoneOffsetFromUtc(timezone, date);
	const offset = timezone ? utcOffset - date.getTimezoneOffset() : 0;

	return new Date(date.getTime() + 60000 * offset);
};

export const parseDateFromICS = (icsString: string, timezone?: string): Date => {
	const strYear = parseInt(icsString.substring(0, 4), 10);
	const strMonth = parseInt(icsString.substring(4, 6), 10) - 1;
	const strDay = parseInt(icsString.substring(6, 8), 10);
	const strHourTest = parseInt(icsString.substring(9, 11), 10);
	const strMinTest = parseInt(icsString.substring(11, 13), 10);
	const strSecTest = parseInt(icsString.substring(13, 15), 10);

	const strHour = isNaN(strHourTest) ? 0 : strHourTest;
	const strMin = isNaN(strMinTest) ? 0 : strMinTest;
	const strSec = isNaN(strSecTest) ? 0 : strSecTest;

	const dateReceived = new Date(strYear, strMonth, strDay, strHour, strMin, strSec);

	return convertDateToLocal(dateReceived, timezone);
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
