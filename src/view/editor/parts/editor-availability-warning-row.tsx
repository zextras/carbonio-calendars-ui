/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { ChipItem, Row, Text } from '@zextras/carbonio-design-system';
import { find, intersectionBy, isNil, startsWith } from 'lodash';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';

import {
	AttendeesAvailabilityListType,
	AttendeesAvailabilityType
} from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { Editor } from '../../../types/editor';

export const getIsBusyAtTimeOfTheEvent = (
	item: AttendeesAvailabilityType,
	start: Editor['start'],
	end: Editor['end'],
	attendeesAvailabilityList: AttendeesAvailabilityListType,
	isAllDay: Editor['allDay']
): boolean => {
	if (start && end && attendeesAvailabilityList && !isNil(isAllDay)) {
		const startDate = new Date(start);
		const endDate = new Date(end);

		const startDay = format(startDate, 'ddMMyyyy');
		const endDay = format(endDate, 'ddMMyyyy');
		const diffInDays = differenceInDays(endDate, startDate);
		const startHour = format(startDate, 'HHmm');
		const endHour = format(endDate, 'HHmm');

		if (isAllDay) {
			const diffInDaysAllDay = differenceInDays(
				startOfDay(addDays(endDate, 1)),
				startOfDay(startDate)
			);
			return diffInDaysAllDay > 1
				? false
				: !!find(
						(item.t ?? []).concat(item.b ?? []),
						(slot) =>
							format(new Date(slot.s), 'dd') === format(startDate, 'dd') ||
							format(new Date(slot.e), 'dd') === format(startDate, 'dd')
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

export const EditorAvailabilityWarningRow = ({
	label,
	list,
	items,
	editorId
}: {
	label: string;
	list: AttendeesAvailabilityListType;
	items: ChipItem[];
	editorId: string;
}): JSX.Element | null => {
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));

	const availableRooms = useMemo(() => intersectionBy(list, items ?? [], 'email'), [items, list]);

	const anyoneIsBusyAtTimeOfEvent = useMemo(
		() =>
			!!find(availableRooms, (item) => getIsBusyAtTimeOfTheEvent(item, start, end, list, allDay)),
		[allDay, list, availableRooms, end, start]
	);

	return anyoneIsBusyAtTimeOfEvent ? (
		<Row height="fit" width="fill" mainAlignment={'flex-start'} padding={{ top: 'small' }}>
			<Text size="small" color="error">
				{label}
			</Text>
		</Row>
	) : null;
};
