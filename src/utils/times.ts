/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DAY_PER_WEEK, HOUR_PER_DAY, MINUTES_PER_HOUR, SECONDS_PER_MINUTE } from '../constants';

function convertsInMinutes(factor: number): (value: number) => number {
	return (value: number) => value * factor;
}
function convertsInMinutes2(value: number): (factor: number) => number {
	return (factor: number) => value / factor;
}

export const secondsInMinutes = (seconds: number): number => seconds / SECONDS_PER_MINUTE;
export const hoursInMinutes = convertsInMinutes(MINUTES_PER_HOUR);
export const daysInMinutes = convertsInMinutes(HOUR_PER_DAY * MINUTES_PER_HOUR);
export const weeksInMinutes = convertsInMinutes(DAY_PER_WEEK * HOUR_PER_DAY * MINUTES_PER_HOUR);

export const minutesInWeeks = (minutes: number): number =>
	minutes / DAY_PER_WEEK / HOUR_PER_DAY / MINUTES_PER_HOUR;
export const minutesInDays = (minutes: number): number => minutes / HOUR_PER_DAY / MINUTES_PER_HOUR;
export const minutesInHours = (minutes: number): number => minutes / MINUTES_PER_HOUR;

export const isWeeksInMinutes = (minutes: number): boolean =>
	minutes % (MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK) === 0;
export const isDaysInMinutes = (minutes: number): boolean =>
	minutes % (MINUTES_PER_HOUR * HOUR_PER_DAY) === 0;
export const isHoursInMinutes = (minutes: number): boolean => minutes % MINUTES_PER_HOUR === 0;
