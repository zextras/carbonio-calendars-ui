/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CalendarsColorType } from '../types/store/calendars';

export const WEEK_SCHEDULE = [
	{ value: '1', label: 'SUNDAY' },
	{ value: '2', label: 'MONDAY' },
	{ value: '3', label: 'TUESDAY' },
	{ value: '4', label: 'WEDNESDAY' },
	{ value: '5', label: 'THURSDAY' },
	{ value: '6', label: 'FRIDAY' },
	{ value: '7', label: 'SATURDAY' }
];

export const CALENDARS_STANDARD_COLORS: Array<CalendarsColorType> = [
	{ color: '#000000', background: '#E6E9ED', label: 'black' },
	{ color: '#007AFF', background: '#F4FBFF', label: 'blue' },
	{ color: '#5AC8FA', background: '#E9F8FE', label: 'cyan' },
	{ color: '#34C759', background: '#EFF8F0', label: 'green' },
	{ color: '#AF52DE', background: '#F2EEF9', label: 'purple' },
	{ color: '#FF3B30', background: '#FDEDED', label: 'red' },
	{ color: '#FFCC00', background: '#FFF7DE', label: 'yellow' },
	{ color: '#FF2D55', background: '#FDECF1', label: 'pink' },
	{ color: '#8E8E93', background: '#F5F6F8', label: 'grey' },
	{ color: '#FF9500', background: '#FFF0EC', label: 'orange' }
];
