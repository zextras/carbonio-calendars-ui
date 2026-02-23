/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';

/**
 * Interface representing the result of calculating ordinal position and weekday code
 */
export interface OrdinalPositionResult {
	ordinalPosition: number;
	weekdayCode: string;
}

/**
 * Day codes mapping for weekdays
 */
const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Calculate the ordinal position and weekday code from a given date.
 * Returns the occurrence of the weekday in the month (1st, 2nd, 3rd, 4th, 5th, or -1 for last).
 *
 * @param date - The date to calculate from (as Date, number (timestamp), or string)
 * @returns Object containing ordinalPosition and weekdayCode
 *
 * @example
 * // For date "2024-02-15" (3rd Thursday of February)
 * calculateOrdinalPosition(new Date('2024-02-15'))
 * // Returns: { ordinalPosition: 3, weekdayCode: 'TH' }
 *
 * @example
 * // For date "2024-02-29" (last Thursday of February in leap year)
 * calculateOrdinalPosition(new Date('2024-02-29'))
 * // Returns: { ordinalPosition: -1, weekdayCode: 'TH' }
 */
export const calculateOrdinalPosition = (date: Date | number | string): OrdinalPositionResult => {
	const momentDate = moment(date);
	const dayOfWeek = momentDate.day(); // 0 = Sunday, 6 = Saturday
	const currentDayOfMonth = momentDate.date();

	// Calculate which occurrence of this weekday in the month (1st, 2nd, 3rd, etc.)
	const occurrence = Math.ceil(currentDayOfMonth / 7);

	// Detect if this is the last occurrence of this weekday in the month.
	// If adding 7 days changes the month, there is no next same weekday in this month.
	const nextWeek = moment(momentDate).add(7, 'days');
	const isLastOccurrence = nextWeek.month() !== momentDate.month();
	const computedOrdinalPosition = isLastOccurrence ? -1 : occurrence;

	return {
		ordinalPosition: computedOrdinalPosition,
		weekdayCode: DAY_CODES[dayOfWeek]
	};
};
