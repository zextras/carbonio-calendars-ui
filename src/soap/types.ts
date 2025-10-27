/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CalendarNameErrors, URLErrors } from '../forms/error-codes';

export type ApiError = {
	errors: {
		url?: URLErrors;
		calendarName?: CalendarNameErrors;
		generic?: string;
	};
};
