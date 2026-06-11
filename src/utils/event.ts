/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT } from '../constants';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';

export type InstanceExceptionId = { d: string; tz: string | undefined };

let counter = 0;

export const getNewId = (id?: string): string => {
	counter += 1;
	return `${id ?? 'new'}-${counter}`;
};

export const getInstanceExceptionId = ({
	start,
	tz,
	allDay
}: {
	start?: EventType['start'];
	tz?: Invite['start']['tz'];
	allDay?: EventType['allDay'];
}): InstanceExceptionId =>
	allDay
		? {
				d: format(new Date(start ?? 0), DATE_FORMAT.ALL_DAY),
				tz
			}
		: {
				d: tz
					? formatInTimeZone(new Date(start ?? 0), tz, DATE_FORMAT.LOCAL)
					: formatInTimeZone(new Date(start ?? 0), 'UTC', DATE_FORMAT.UTC),
				tz
			};
