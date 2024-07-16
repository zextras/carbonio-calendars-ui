/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';

import { DATE_FORMAT } from '../constants';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';

export type InstanceExceptionId = { d: string; tz: string | undefined };

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
				d: moment(start).format(DATE_FORMAT.ALL_DAY),
				tz
			}
		: {
				d: tz
					? moment(start).tz(tz).format(DATE_FORMAT.LOCAL)
					: moment(start).utc().format(DATE_FORMAT.UTC),
				tz
			};
