/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Chip } from '@zextras/carbonio-design-system';
import { find, isNil, startsWith } from 'lodash';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	AttendeesAvailabilityListType,
	AttendeesAvailabilityType
} from '../../../hooks/use-attendees-availability';
import { Editor } from '../../../types/editor';

export const getIsBusyAtTimeOfTheEvent = (
	item: AttendeesAvailabilityType,
	start: Editor['start'],
	end: Editor['end'],
	attendeesAvailabilityList: AttendeesAvailabilityListType,
	isAllDay: Editor['allDay']
): boolean => {
	if (start && end && attendeesAvailabilityList && !isNil(isAllDay)) {
		const startDate = moment(start);
		const endDate = moment(end);

		const startDay = startDate.format('DDMMYYYY');
		const endDay = endDate.format('DDMMYYYY');
		const diffInDays = endDate.diff(startDate, 'days');
		const startHour = startDate.format('HHmm');
		const endHour = endDate.format('HHmm');

		if (isAllDay) {
			const diffInDaysAllDay = endDate
				.add(1, 'day')
				.startOf('day')
				.diff(startDate.startOf('day'), 'days');
			return diffInDaysAllDay > 1
				? false
				: !!find(
						(item.t ?? []).concat(item.b ?? []),
						(slot) =>
							moment(slot.s).format('DD') === startDate.format('DD') ||
							moment(slot.e).format('DD') === startDate.format('DD')
				  );
		}

		// from 00:00 to 00:00
		const lastsEntireDay = diffInDays === 1 && startHour === endHour && startsWith(startHour, '00');
		const endsTheSameDay = startDay === endDay;
		if (lastsEntireDay || endsTheSameDay) {
			return !!find(
				(item.t ?? []).concat(item.b ?? []),
				(slot) =>
					// appointment starts while attendee is busy
					(start > slot.s && start < slot.e) ||
					// the appointment ends while attendee is busy
					(end > slot.s && end < slot.e) ||
					// the appointment starts before the attendee is busy and ends after the attendee is busy
					(start < slot.s && end > slot.e) ||
					// the appointment starts when the attendee has another appointment starting at the same time
					start === slot.s ||
					// the appointment ends when the attendee has another appointment ending at the same time
					end === slot.e
			);
		}
	}

	return false;
};

export const AttendeesChip = ({
	start,
	end,
	allDay,
	attendeesAvailabilityList,
	...rest
}: {
	start: number | undefined;
	end: number | undefined;
	attendeesAvailabilityList: AttendeesAvailabilityListType;
	allDay: boolean | undefined;
	email?: string;
	label?: string;
}): JSX.Element | null => {
	const [t] = useTranslation();
	const { email, label } = rest;
	const chipLabel = email ?? label;
	if (chipLabel) {
		if (attendeesAvailabilityList) {
			const currentChipAvailability = find(attendeesAvailabilityList, ['email', chipLabel]);

			if (currentChipAvailability) {
				const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
					currentChipAvailability,
					start,
					end,
					attendeesAvailabilityList,
					allDay
				);
				const action = isBusyAtTimeOfEvent
					? [
							{
								id: 'unavailable',
								label: t(
									'attendee_unavailable',
									'Attendee not available at the selected time of the event'
								),
								color: 'error',
								type: 'icon',
								icon: 'AlertTriangle'
							} as const
					  ]
					: undefined;
				return <Chip {...rest} label={chipLabel} actions={action} />;
			}
		}
		return <Chip {...rest} label={chipLabel} />;
	}
	return null;
};
