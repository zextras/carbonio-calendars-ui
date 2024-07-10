/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	DAYS_PER_WEEK,
	HOURS_PER_DAY,
	MINUTES_PER_DAY,
	MINUTES_PER_HOUR,
	MINUTES_PER_WEEK,
	SECONDS_PER_MINUTE
} from '../constants';

function converts(
	fn: (value: number, factor: number) => number
): (factor: number) => (value: number) => number {
	return (factor: number) => (value: number) => fn(value, factor);
}

const convertsIn = converts((value, factor) => value * factor);
const convertsFrom = converts((value, factor) => value / factor);

export const daysToMinutes = convertsIn(MINUTES_PER_DAY);
export const hoursToMinutes = convertsIn(MINUTES_PER_HOUR);
export const weeksToMinutes = convertsIn(MINUTES_PER_WEEK);

export const secondsToMinutes = convertsFrom(SECONDS_PER_MINUTE);
export const minutesToHours = convertsFrom(MINUTES_PER_HOUR);
export const minutesToDays = convertsFrom(MINUTES_PER_DAY);
export const minutesToWeeks = convertsFrom(MINUTES_PER_WEEK);

export const isWeeksInMinutes = (minutes: number): boolean =>
	minutes % (MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_WEEK) === 0;
export const isDaysInMinutes = (minutes: number): boolean =>
	minutes % (MINUTES_PER_HOUR * HOURS_PER_DAY) === 0;
export const isHoursInMinutes = (minutes: number): boolean => minutes % MINUTES_PER_HOUR === 0;
