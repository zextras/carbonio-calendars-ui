/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isValid, parseISO } from 'date-fns';

/**
 * Parses the `until` value of a recurrence rule.
 * The server may return it either as a date (`yyyyMMdd`) or as a UTC date-time
 * (`yyyyMMdd'T'HHmmss'Z'`): both are ISO 8601 basic formats.
 * Returns the fallback when the value is missing or cannot be parsed, so callers never
 * end up with an Invalid Date (which makes `format` throw "Invalid time value").
 */
export const parseRecurrenceUntil = (until: string | undefined, fallback: Date): Date => {
	if (!until) {
		return fallback;
	}
	const parsed = parseISO(until);
	return isValid(parsed) ? parsed : fallback;
};
