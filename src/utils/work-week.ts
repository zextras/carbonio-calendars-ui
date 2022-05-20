/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AccountSettings } from '@zextras/carbonio-shell-ui';
import { map, sortBy } from 'lodash';

export interface WorkWeekDay {
	day: string;
	working: boolean;
	start: string;
	end: string;
}

export const workWeek = (settings: AccountSettings): WorkWeekDay[] =>
	sortBy(
		map(
			(settings.prefs.zimbraPrefCalendarWorkingHours as string)?.split(','),
			(t: string): WorkWeekDay =>
				({
					day: t.split(':')[0],
					working: t.split(':')[1] !== 'N',
					start: t.split(':')[2],
					end: t.split(':')[3]
				} as WorkWeekDay)
		),
		'day'
	);
