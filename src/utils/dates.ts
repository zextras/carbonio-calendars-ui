/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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

export const applyTimezoneToLocalDate = (date: Date, timezone?: string): Date => {
	const utcOffset = getTimezoneOffsetFromUtc(timezone, date);
	const offset = timezone ? utcOffset - date.getTimezoneOffset() : 0;

	return new Date(date.getTime() + 60000 * offset);
};

export const parseDateFromICS = (icsString: string): string => {
	const strYear = parseInt(icsString.substring(0, 4), 10);
	const strMonth = parseInt(icsString.substring(4, 6), 10) - 1;
	const strDay = parseInt(icsString.substring(6, 8), 10);
	const strHourTest = parseInt(icsString.substring(9, 11), 10);
	const strMinTest = parseInt(icsString.substring(11, 13), 10);
	const strSecTest = parseInt(icsString.substring(13, 15), 10);

	const strHour = isNaN(strHourTest) ? 0 : strHourTest;
	const strMin = isNaN(strMinTest) ? 0 : strMinTest;
	const strSec = isNaN(strSecTest) ? 0 : strSecTest;

	const isUTC = icsString.substring(15, 16) === 'Z';

	const date = new Date(strYear, strMonth, strDay, strHour, strMin, strSec);

	return isUTC
		? new Date(
				Date.UTC(
					date.getUTCFullYear(),
					date.getUTCMonth(),
					date.getUTCDate(),
					date.getUTCHours(),
					date.getUTCMinutes(),
					date.getUTCSeconds()
				)
			).toUTCString()
		: date.toString();
};

export const parseDateToICS = (stringToParse: string): string => {
	const date = new Date(stringToParse);

	const pad0Start = (number: number): string =>
		`${number}`.length > 1 ? `${number}` : `0${number}`;

	const year = date.getFullYear();
	const month = pad0Start(date.getMonth() + 1);
	const day = pad0Start(date.getDate());
	const hour = pad0Start(date.getHours());
	const minute = pad0Start(date.getMinutes());
	const second = pad0Start(date.getSeconds());

	const isNotUTC = /GMT[+-]/.test(stringToParse);
	return `${year}${month}${day}T${hour}${minute}${second}${isNotUTC ? '' : 'Z'}`;
};
