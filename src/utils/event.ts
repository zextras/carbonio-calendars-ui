/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { omit } from 'lodash';

import { DATE_FORMAT } from '../constants';
import { EventResource, EventType } from '../types/event';
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

/**
 * An exception (e.g. the one the server creates on the organizer's side when an attendee
 * replies to a single instance) is still an occurrence of its series, but the server returns
 * it with recur=false, so isRecurrent alone is not enough to tell.
 */
export const isOccurrenceOfSeries = (
	resource: Pick<EventResource, 'isRecurrent' | 'isException'>
): boolean => resource.isRecurrent || !!resource.isException;

/**
 * The event to use for the actions on the whole series of an occurrence: for an exception the
 * series invite differs from the instance one.
 */
export const toSeriesEvent = (event: EventType): EventType => ({
	...event,
	resource: {
		...omit(event.resource, 'ridZ'),
		inviteId: event.resource.seriesInviteId ?? event.resource.inviteId,
		isRecurrent: true,
		isException: false
	}
});
