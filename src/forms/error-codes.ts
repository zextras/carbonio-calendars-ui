/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const URL_HTTP_OR_HTTPS_CODE = 'must_begin_with_http_or_https';
export const URL_NOT_A_CALENDAR = 'not_a_calendar';
export const URL_UNREACHABLE = 'unreachable';

export const URL_ERROR_CODES = [
	URL_HTTP_OR_HTTPS_CODE,
	URL_NOT_A_CALENDAR,
	URL_UNREACHABLE
] as const;

export const CALENDAR_NAME_ALREADY_EXISTS = 'duplicated';
export const CALENDAR_NAME_ERROR_CODES = [CALENDAR_NAME_ALREADY_EXISTS] as const;

export type UrlErrorCode = (typeof URL_ERROR_CODES)[number];
export type CalendarNameErrorCode = (typeof CALENDAR_NAME_ERROR_CODES)[number];

export type CalendarNameErrors = Partial<Record<CalendarNameErrorCode, string>>;
export type URLErrors = Partial<Record<UrlErrorCode, string>>;
