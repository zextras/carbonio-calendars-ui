/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const CALENDAR_APP_ID = 'carbonio-calendars-ui';

export const CALENDAR_ROUTE = 'calendars';

export const PANEL_VIEW = {
	APP: 'app',
	BOARD: 'board',
	SEARCH: 'search'
} as const;

export const PREFS_DEFAULTS = {
	DEFAULT_CALENDAR_ID: '10'
};

export const ROOM_DIVIDER =
	'-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-';

export const MESSAGE_DIVIDER =
	'-::::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_:::-';

export const HTML_OPENING_TAG = "<html><body id='htmlmode'>";
export const HTML_CLOSING_TAG = '</body></html>';

export const CALENDAR_RESOURCES = {
	ROOM: 'ROO',
	RESOURCE: 'RES'
} as const;

export const SHARE_USER_TYPE = {
	USER: 'usr',
	PUBLIC: 'pub'
} as const;

export const PUBLIC_SHARE_ZID = '99999999-9999-9999-9999-999999999999';

export const DATE_FORMAT = {
	ALL_DAY: 'YYYYMMDD',
	LOCAL: 'YYYYMMDD[T]HHmmss',
	UTC: 'YYYYMMDD[T]HHmmss[Z]'
};

export const MS_PER_MINUTE = 60000;
export const MS_PER_HOUR = 3600000;
export const MS_PER_DAY = 86400000;
export const MS_PER_MONTH = 2629746000;
