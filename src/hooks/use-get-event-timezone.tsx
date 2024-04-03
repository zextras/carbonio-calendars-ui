/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { getLocalTime, isTimezoneDifferentFromLocal } from '../normalizations/normalize-editor';
import { DateType } from '../types/event';

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

export const useGetEventTimezoneString = (
	start: number | DateType,
	end: number | DateType,
	allDay: boolean | undefined,
	timezone: string | undefined
): {
	localTimeString: string;
	localTimezoneString: string;
	eventTimeString: string;
	eventTimezoneString: string;
	showTimezoneTooltip: boolean;
	localTimezoneTooltip: JSX.Element;
	eventTimezoneTooltip: JSX.Element;
} => {
	const [t] = useTranslation();
	const allDayLabel = t('label.all_day', 'All day');

	const localTimezone = useMemo(() => moment.tz.guess(), []);
	const localStart = getLocalTime(start, localTimezone);
	const localEnd = getLocalTime(end, localTimezone);

	const eventStart = useMemo(() => getLocalTime(start, timezone), [start, timezone]);
	const eventEnd = useMemo(() => getLocalTime(end, timezone), [end, timezone]);

	const getTimeZoneString = useCallback(
		(_start, _timezone) => {
			if (_timezone && !allDay) {
				return `GMT ${moment(_start).startOf('year').tz(_timezone).format('Z')} ${_timezone}`;
			}
			return `GMT ${moment(_start).startOf('year').tz(localTimezone).format('Z')} ${localTimezone}`;
		},
		[allDay, localTimezone]
	);

	const getTimezoneTooltip = useCallback(
		(label, timeString, timezoneString) => (
			<>
				{label}
				<br />
				{timeString}
				<br />
				{timezoneString}
			</>
		),
		[]
	);
	const localTimeString = useMemo(
		() => getTimeString(localStart, localEnd, allDay, allDayLabel),
		[localStart, localEnd, allDay, allDayLabel]
	);

	const eventTimeString = useMemo(
		() => getTimeString(eventStart, eventEnd, allDay, allDayLabel),
		[eventStart, eventEnd, allDay, allDayLabel]
	);

	const localTimezoneString = useMemo(
		() => getTimeZoneString(localStart, localTimezone),
		[getTimeZoneString, localStart, localTimezone]
	);

	const eventTimezoneString = useMemo(
		() => getTimeZoneString(eventStart, timezone),
		[getTimeZoneString, eventStart, timezone]
	);

	const showTimezoneTooltip = useMemo(() => {
		if (timezone && start) {
			return isTimezoneDifferentFromLocal(start, timezone);
		}
		return isTimezoneDifferentFromLocal(start, localTimezone);
	}, [localTimezone, start, timezone]);

	const localTimezoneTooltip = useMemo(
		() =>
			getTimezoneTooltip(
				t('creation_timezone_tooltip', 'Date and time on creation timezone:'),
				eventTimeString,
				eventTimezoneString
			),
		[eventTimeString, eventTimezoneString, getTimezoneTooltip, t]
	);

	const eventTimezoneTooltip = useMemo(
		() =>
			getTimezoneTooltip(
				t('local_timezone_tooltip', 'Date and time on local timezone:'),
				localTimeString,
				localTimezoneString
			),
		[getTimezoneTooltip, t, localTimeString, localTimezoneString]
	);

	return {
		localTimeString,
		localTimezoneString,
		eventTimeString,
		eventTimezoneString,
		showTimezoneTooltip,
		localTimezoneTooltip,
		eventTimezoneTooltip
	};
};
