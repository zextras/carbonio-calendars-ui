/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CalendarNameErrorCode, UrlErrorCode } from './error-codes';

export type URLErrors = Partial<Record<UrlErrorCode, string>>;
export type CalendarNameErrors = Partial<Record<CalendarNameErrorCode, string>>;
export type ApiError = {
	errors: {
		url?: URLErrors;
		calendarName?: CalendarNameErrors;
		generic?: string;
	};
};
